// import { createClient } from '@supabase/supabase-js';

// // Single client instance for all operations
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // Main client (use this everywhere)
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: true
//   }
// });

// // Alias for backward compatibility
// export const supabasePublic = supabase;

// // For server-side admin operations (optional)
// export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
//   ? createClient(
//       supabaseUrl,
//       process.env.SUPABASE_SERVICE_ROLE_KEY,
//       {
//         auth: { autoRefreshToken: false, persistSession: false }
//       }
//     )
//   : null;
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Single client instance for all operations
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure flow
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting for real-time updates
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'snippetly@1.0.0',
      },
    },
  }
);

// Alias for backward compatibility
export const supabasePublic = supabase;

// For server-side admin operations (optional)
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        }
      }
    )
  : null;

// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    return !error;
  } catch {
    return false;
  }
}