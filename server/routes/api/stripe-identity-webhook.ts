import { defineEventHandler, readRawBody, getHeader } from "h3";
import type { Stripe as StripeType } from "stripe";

/**
 * Stripe Identity webhook handler.
 *
 * Receives `identity.verification_session.verified` and
 * `identity.verification_session.requires_input` events from Stripe
 * and updates the corresponding dealer_application record.
 *
 * Set up in Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *   URL: https://yourdomain.com/api/stripe-identity-webhook
 *   Events: identity.verification_session.verified, identity.verification_session.requires_input
 */
export default defineEventHandler(async (event) => {
  const signature = getHeader(event, "stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  if (!webhookSecret) {
    console.warn(
      "[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured",
    );
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return new Response("STRIPE_SECRET_KEY is not configured", {
      status: 500,
    });
  }

  // Dynamically import Stripe (server-only)
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  // Read raw body for signature verification
  const rawBody = await readRawBody(event, "utf8");
  if (!rawBody) {
    return new Response("Empty request body", { status: 400 });
  }

  let stripeEvent: StripeType.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  if (
    stripeEvent.type === "identity.verification_session.verified" ||
    stripeEvent.type === "identity.verification_session.requires_input"
  ) {
    const session = stripeEvent.data.object as any;
    const userId = session.metadata?.user_id as string | undefined;
    const sessionId = session.id as string;

    if (!userId || !sessionId) {
      return new Response("Missing user_id or session_id in metadata", {
        status: 200,
      });
    }

    const verificationStatus =
      stripeEvent.type === "identity.verification_session.verified"
        ? "verified"
        : "requires_input";

    const { error } = await supabaseAdmin
      .from("dealer_applications")
      .update({
        verification_status: verificationStatus,
        stripe_verification_session_id: sessionId,
      })
      .eq("user_id", userId);

    if (error) {
      console.error(
        "[Stripe Webhook] Failed to update application:",
        error.message,
      );
      return new Response("Database update failed", { status: 500 });
    }

    console.log(
      `[Stripe Webhook] User ${userId} verification status -> ${verificationStatus}`,
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
