import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses RLS, so this
// file must never be imported into client components. All access control
// (workspace membership, plan limits) is enforced in the API routes that use it.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
