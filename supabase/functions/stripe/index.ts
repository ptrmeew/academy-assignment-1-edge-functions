import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { getStripeCustomer } from "../_shared/getStripeCustomer.ts";
import { checkoutSessionsCreate } from "./checkout-sessions-create.ts";

const SKIP_CUSTOMER = Deno.env.get("STRIPE_SKIP_CUSTOMER") === "true";

serve(async (req) => {
  const searchParams = new URL(req.url).searchParams;
  const target = searchParams.get("target");

  const body = await req.json().catch(() => {
    return {};
  });

  let res, user;
  switch (target) {
    case "checkout.session.create":
      if (SKIP_CUSTOMER) res = await checkoutSessionsCreate(body);
      else {
        // Retrieve/create stripe customer
        user = await getStripeCustomer(req);
        // If there's a customer create checkout session
        res =
          typeof user === "string"
            ? await checkoutSessionsCreate(body, user)
            : user;
      }
      break;
    default:
      res = new Response("Target is invalid", {
        status: 400,
      });
  }

  return res;
});
