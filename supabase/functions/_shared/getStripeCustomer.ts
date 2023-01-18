import { stripe } from "./stripe.ts";
import { supabase } from "./supabase.ts";

export const getStripeCustomer = async (req: Request) => {
  // Get token
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  // Find auth by token
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  // Find user by auth
  const userResponse = await supabase
    .from("user")
    .select("*")
    // .eq("auth_fk", user?.id)
    .eq("auth_fk", "a9fe9b29-8e76-440d-ad89-8e1a854bcbb1")
    .single();

  if (userResponse?.error)
    return new Response("User not found", {
      status: 400,
    });

  if (userResponse.data.stripe_customer_id)
    return userResponse.data.stripe_customer_id;

  // If there's no customer create one
  const customer = await stripe.customers.create({
    metadata: {
      userId: userResponse.data.id,
    },
  });

  if (!customer)
    return new Response("Customer couldn't created", {
      status: 400,
    });

  // Update user with new customer id
  const userUpdateResponse = await supabase
    .from("user")
    .update({
      stripe_customer_id: customer.id,
    })
    // .eq("auth_fk", user?.id)
    .eq("auth_fk", "a9fe9b29-8e76-440d-ad89-8e1a854bcbb1")
    .single();

  if (userUpdateResponse?.error)
    return new Response("User couldn't updated", {
      status: 400,
    });

  return customer.id;
};
