import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: "sb-auth-token",
      // Improved debug settings
      debug: process.env.NODE_ENV === "development",
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "X-Client-Info": "snippetly@1.0.0",
      },
    },
  }
);

export const supabasePublic = supabase;

export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1)
      .single();

    return !error;
  } catch {
    return false;
  }
}

// Helper function to test OAuth setup
export async function testOAuthProviders() {
  if (process.env.NODE_ENV !== "development") return;

  console.log("Testing OAuth configuration...");

  const baseUrl = window.location.origin;
  console.log("Base URL:", baseUrl);
  console.log("Callback URL should be:", `${baseUrl}/api/auth/callback`);

  console.log(
    "Make sure your Supabase Auth settings include this callback URL"
  );
}
