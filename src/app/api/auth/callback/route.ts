import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/snippets";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("OAuth callback received:", { 
    hasCode: !!code, 
    error, 
    errorDescription,
    next 
  });

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // Handle successful OAuth flow
  if (code) {
    try {
      console.log("Exchanging code for session...");
      
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        
        // Handle specific PKCE errors
        if (exchangeError.message?.includes('code verifier') || 
            exchangeError.message?.includes('PKCE')) {
          return NextResponse.redirect(
            `${origin}/login?error=oauth_restart&message=Please try signing in again`
          );
        }
        
        return NextResponse.redirect(
          `${origin}/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.email);

        // Create/update profile - improved version
        try {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            console.log("Creating profile for OAuth user");
            
            // Better username extraction for OAuth
            const metadata = data.user.user_metadata;
            const username = 
              metadata?.preferred_username ||  // GitHub
              metadata?.user_name ||          // GitHub alternative
              metadata?.name?.replace(/\s+/g, '_') || // Google name
              metadata?.full_name?.replace(/\s+/g, '_') ||
              data.user.email?.split("@")[0] ||
              `user_${data.user.id.slice(0, 8)}`;

            const { error: profileError } = await supabase.from("profiles").insert({
              id: data.user.id,
              username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_'),
              bio: "",
              avatar_url: metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });

            if (profileError) {
              console.warn("Profile creation failed:", profileError);
              // Don't fail the login for profile creation issues
            } else {
              console.log("Profile created successfully");
            }
          } else {
            console.log("Profile already exists");
          }
        } catch (profileError) {
          console.warn("Profile operation failed:", profileError);
          // Don't fail the login for profile operations
        }

        // Success - redirect to destination
        const redirectUrl = `${origin}${next}`;
        console.log("Redirecting to:", redirectUrl);
        
        const response = NextResponse.redirect(redirectUrl);
        
        // Set secure headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      } else {
        console.error("No user data after successful exchange");
        return NextResponse.redirect(
          `${origin}/login?error=no_user_data&message=Authentication succeeded but no user data received`
        );
      }
    } catch (error: any) {
      console.error("Unexpected auth callback error:", error);
      return NextResponse.redirect(
        `${origin}/login?error=unexpected_error&message=${encodeURIComponent(
          error.message || "An unexpected error occurred"
        )}`
      );
    }
  }

  // No code provided
  console.error("No authorization code provided");
  return NextResponse.redirect(
    `${origin}/login?error=no_code&message=No authorization code received`
  );
}