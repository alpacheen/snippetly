import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/snippets";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  // Handle authorization code
  if (code) {
    try {
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      if (data.user) {
        // Check if user has a profile, create one if not
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          // Create username from user metadata or email
          const username =
            data.user.user_metadata?.username ||
            data.user.user_metadata?.name ||
            data.user.user_metadata?.display_name ||
            data.user.email?.split("@")[0] ||
            `user_${data.user.id.slice(0, 8)}`;

          // Insert with correct field names matching your schema
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username,
              bio: "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // Don't fail auth if profile creation fails - user can create it later
          }
        }

        // Successful authentication
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
