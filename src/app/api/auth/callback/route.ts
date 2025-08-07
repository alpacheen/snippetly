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
        // Create profile if needed
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .single();

          if (!profile) {
            const username =
              data.user.user_metadata?.username ||
              data.user.user_metadata?.name ||
              data.user.user_metadata?.display_name ||
              data.user.email?.split("@")[0] ||
              `user_${data.user.id.slice(0, 8)}`;

            await supabase.from("profiles").insert({
              id: data.user.id,
              username: username,
              bio: "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });
          }
        } catch (profileError) {
          console.warn("Profile creation failed:", profileError);
        }

        // Success - redirect to destination
        const redirectUrl = `${origin}${next}`;
        const response = NextResponse.redirect(redirectUrl);
        
        // Set secure headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}