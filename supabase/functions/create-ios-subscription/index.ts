import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import axiod from 'https://deno.land/x/axiod@0.26.2/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getClient, supabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const authHeader = req.headers.get('Authorization');
  const supabase = getClient(authHeader!);

  const authUser = await supabase.auth.getUser();

  if (!authUser || !authUser.data) {
    return new Response(
      JSON.stringify({
        message: 'Authentication failed',
        code: 'E_AUTH_FAILED',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  const profileResponse = await supabaseAdmin
    .from('profile')
    .select('*')
    .eq('id', authUser.data.user!.id)
    .single();

  if (profileResponse.error) {
    return new Response(
      JSON.stringify({
        message: 'Auth successful but profile not found',
        code: 'E_PROFILE_NOT_FOUND',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  const profile = profileResponse.data;

  const { receiptData } = await req.json();

  try {
    const verificationResponse = await axiod.post(Deno.env.get('IOS_VERIFY_RECEIPT_URL')!, {
      'receipt-data': receiptData,
      'password': Deno.env.get('APP_STORE_CONNECT_SECRET'),
      'exclude-old-transactions': true,
    });

    const receipt = verificationResponse.data.latest_receipt_info[0];

    const iosSubscription = {
      product_id: receipt.product_id,
      auto_renew_product_id: verificationResponse.data.pending_renewal_info[0].auto_renew_product_id,
      expires_date_ms: receipt.expires_date_ms,
      original_transaction_id: receipt.original_transaction_id,
      will_auto_renew: true,
    };

    const iosSubscriptionResponse = await supabaseAdmin
      .from('ios_subscription')
      .insert(iosSubscription)
      .select('*')
      .single();

    if (iosSubscriptionResponse.error) throw iosSubscriptionResponse.error;

    const updateProfileResponse = await supabaseAdmin
      .from('profile')
      .update({
        subscription_active: true,
        ios_subscription_fk: iosSubscriptionResponse.data.id,
      })
      .eq('id', profile.id);

    if (updateProfileResponse.error) throw updateProfileResponse.error;

    return new Response(
      'OK',
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        message: 'Verification process failed',
        code: 'E_SUBSCRIPTION_VERIFICATION_FAILED',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
