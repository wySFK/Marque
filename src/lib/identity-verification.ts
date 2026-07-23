import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { stripe } from "@/lib/stripe.server";

// ── Create a Stripe Identity verification session ──────────────────────

export const createVerificationSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      returnUrl: z.string().url(),
    }),
  )
  .handler(async ({ context, data }) => {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { user_id: context.userId },
      return_url: data.returnUrl,
    });

    // Save the session ID in the user's application
    await supabaseAdmin
      .from("dealer_applications")
      .update({
        stripe_verification_session_id: session.id,
        verification_status: "pending",
      })
      .eq("user_id", context.userId);

    return {
      url: session.url,
      sessionId: session.id,
    };
  });

// ── Check the status of an existing verification session ───────────────

export const checkVerificationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      sessionId: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const session = await stripe.identity.verificationSessions.retrieve(
      data.sessionId,
    );

    // Map Stripe statuses to our internal status
    let verificationStatus: string;
    switch (session.status) {
      case "verified":
        verificationStatus = "verified";
        break;
      case "requires_input":
        verificationStatus = "requires_input";
        break;
      // processing or any other status means still pending
      default:
        verificationStatus = "pending";
    }

    // Update the application record
    await supabaseAdmin
      .from("dealer_applications")
      .update({ verification_status: verificationStatus })
      .eq("user_id", context.userId)
      .eq("stripe_verification_session_id", data.sessionId);

    return {
      status: verificationStatus,
      sessionId: data.sessionId,
    };
  });
