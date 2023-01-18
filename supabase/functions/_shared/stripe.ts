import Stripe from "https://esm.sh/stripe@11.5.0?target=deno&no-check";

const STRIPE_API_SECRET = Deno.env.get("STRIPE_API_SECRET");
const STRIPE_API_VERSION = Deno.env.get("STRIPE_API_VERSION");

export const stripe = new Stripe(STRIPE_API_SECRET, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: STRIPE_API_VERSION,
});
