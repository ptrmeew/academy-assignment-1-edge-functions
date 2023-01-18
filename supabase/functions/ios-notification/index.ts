// IMPORTANT: This function must be deployed with the --no-verify-jwt argument as it needs to be public to work

import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.82.0/encoding/base64.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

const decode = (payload: string) => {
  const parts = payload.split('.');
  const textDecoder = new TextDecoder();
  return JSON.parse(textDecoder.decode(base64Decode(parts[1])));
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { signedPayload } = await req.json();
  const payload = decode(signedPayload);
  const transaction = decode(payload.data.signedTransactionInfo);
  const renewelInfo = decode(payload.data.signedRenewalInfo);

  // Fetch ios subscription based on original_transaction_id

  const iosSubscriptionResponse = await supabaseAdmin
    .from('ios_subscription')
    .select('*')
    .eq('original_transaction_id', transaction.originalTransactionId)
    .single();

  const iosSubscription = iosSubscriptionResponse.data;

  if (!iosSubscription) {
    // TODO: Possibly log or notify about error
    return new Response(
      'No subscription for transaction',
    );
  }

  // Remove subscription from profile
  if (payload.notificationType === 'EXPIRED') {
    const profileResponse = await supabaseAdmin
      .from('profile')
      .select('*')
      .eq('ios_subscription_fk', iosSubscription.id)
      .single();

    const profile = profileResponse.data;

    if (profile) {
      await supabaseAdmin
        .from('profile')
        .update({
          subscription_active: false,
        })
        .eq('id', profile.id);
    }
  } else {
    // Indicates a subscription upgrade/downgrade/crossgrade
    if (payload.notificationType === 'DID_CHANGE_RENEWAL_PREF') {
      iosSubscription.auto_renew_product_id = renewelInfo.autoRenewProductId;
    }

    // If an auto_renew_product_id is different from product then the product_id must be updated
    if (payload.notificationType === 'DID_RENEW') {
      if (iosSubscription.product_id !== iosSubscription.auto_renew_product_id) {
        iosSubscription.product_id = iosSubscription.auto_renew_product_id;
      }
    }

    // Create an entry with the notification type and subtype
    await supabaseAdmin
      .from('subscription_notification')
      .insert({
        message: payload.notificationType,
        message_subtype: payload.subtype,
        timestamp: new Date().toISOString(),
        ios_subscription_fk: iosSubscription.id,
      });

    iosSubscription.expires_date_ms = transaction.expiresDate;
    iosSubscription.will_auto_renew = renewelInfo.autoRenewStatus === 1;

    await supabaseAdmin
      .from('ios_subscription')
      .update(iosSubscription)
      .eq('id', iosSubscription.id);
  }

  return new Response(
    'Ok',
    { headers: { 'Content-Type': 'application/json' } },
  );
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
