import Stripe from "stripe";

function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. " +
        "Get your Stripe secret key from https://dashboard.stripe.com/apikeys",
    );
  }
  // Use the default API version bundled with the Stripe SDK
  return new Stripe(key);
}

let _stripe: Stripe | undefined;

/**
 * Server-side Stripe client.
 * Only import this within `.server.ts` modules or inside `createServerFn` callbacks
 * so the `stripe` Node library never leaks into the client bundle.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop, receiver) {
    if (!_stripe) _stripe = createStripeClient();
    return Reflect.get(_stripe, prop, receiver);
  },
});
