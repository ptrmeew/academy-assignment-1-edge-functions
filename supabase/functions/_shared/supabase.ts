import { createClient } from 'https://esm.sh/v99/@supabase/supabase-js@2.1.1/dist/module/index';
import type { Database } from '../types/database-types.ts';

export const getClient = (authHeader: string) => {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    },
  );
};

export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
