import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.170.0/node/internal/buffer.mjs";
import { stripe } from "../_shared/stripe.ts";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  if (!req.body)
    return new Response("Bad Request", {
      status: 400,
    });

  // Parsing body into Buffer
  const chunks = [];
  for await (const chunk of req.body) chunks.push(chunk);
  let event = Buffer.concat(chunks);

  // Get the signature sent by Stripe
  const signature = req.headers.get("stripe-signature");
  try {
    // Construct event with raw body, signature and secret
    event = stripe.webhooks.constructEvent(
      event,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return new Response(err.message, {
      status: 400,
    });
  }

  // AFTER SIGNED

  return Response.json(event);
});
