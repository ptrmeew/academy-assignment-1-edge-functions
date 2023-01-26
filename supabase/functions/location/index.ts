import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

function ips(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(/\s*,\s*/);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  const clientIps = ips(req) || [''];
  const res = await fetch(`https://ipinfo.io/${clientIps[0]}?token=${Deno.env.get('IPINFO_TOKEN')}`, {
      headers: { 'Content-Type': 'application/json'}});
  const { city, country } = await res.json();

  return new Response(
    JSON.stringify(`You're accessing from ${city}, ${country}`),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  )
})