import { Checkout, Item } from "../types/stripe-types.ts";
import { stripe } from "../_shared/stripe.ts";

const RETURN_SESSION = Deno.env.get("STRIPE_RETURN_SESSION") === "true";

export const checkoutSessionsCreate = async (
  body: Checkout,
  customer?: string
) => {
  try {
    let { success_url, cancel_url, mode, items } = body;

    // TODO: CHECK BODY VALIDATION HERE

    if (success_url?.includes("?") || cancel_url?.includes("?"))
      return new Response("successUrl and cancelUrl can't have parameters", {
        status: 400,
      });

    // Add params to the return urls
    success_url += `?success=true${
      RETURN_SESSION ? "&session_id={CHECKOUT_SESSION_ID}" : ""
    }`;
    if (cancel_url) cancel_url += `?success=false`;

    const line_items = items.map((item: Item) => {
      return { price: item.price, quantity: item?.quantity || 1 };
    });

    const session = await stripe.checkout.sessions.create({
      success_url,
      cancel_url,
      line_items,
      mode,
      customer,
    });
    return Response.json(session.url);
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe", error);
    return new Response("Stripe session not created", {
      status: 400,
    });
  }
};
