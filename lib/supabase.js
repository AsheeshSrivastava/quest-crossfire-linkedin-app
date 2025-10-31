// Supabase client utility
import { createClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when first accessed
let _supabaseAdmin = null;

export function getSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase env vars:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      allEnvVars: Object.keys(process.env)
    });
    throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseServiceKey}`);
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return _supabaseAdmin;
}

// Export object with methods that call getSupabaseAdmin()
export const supabaseAdmin = {
  from: (...args) => getSupabaseAdmin().from(...args),
  auth: {
    admin: {
      createUser: (...args) => getSupabaseAdmin().auth.admin.createUser(...args)
    }
  }
};

// Client-side client (uses anon key, respects RLS)
export function createSupabaseClient(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    }
  });
}
