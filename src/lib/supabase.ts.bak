// // src/lib/supabase.ts - SINGLETON VERSION (fixes multiple client warning)
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { createClient } from '@supabase/supabase-js';
// import type { SupabaseClient } from '@supabase/supabase-js';

// // Singleton instances
// let supabaseInstance: SupabaseClient | null = null;
// let supabasePublicInstance: SupabaseClient | null = null;
// let supabaseAdminInstance: SupabaseClient | null = null;

// // For client-side usage (singleton)
// export const supabase = (() => {
//   if (!supabaseInstance) {
//     supabaseInstance = createClientComponentClient();
//   }
//   return supabaseInstance;
// })();

// // For public/anon operations (singleton)
// export const supabasePublic = (() => {
//   if (!supabasePublicInstance) {
//     supabasePublicInstance = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );
//   }
//   return supabasePublicInstance;
// })();

// // For server-side admin operations (singleton)
// export const supabaseAdmin = (() => {
//   if (!supabaseAdminInstance && process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     supabaseAdminInstance = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY,
//       {
//         auth: { autoRefreshToken: false, persistSession: false }
//       }
//     );
//   }
//   return supabaseAdminInstance;
// })();
// src/lib/supabase.ts - SIMPLE VERSION (no auth helpers)
import { createClient } from '@supabase/supabase-js';

// Single client instance for all operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Main client (use this everywhere)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Alias for backward compatibility
export const supabasePublic = supabase;

// For server-side admin operations (optional)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )
  : null;