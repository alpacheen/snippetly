import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/snippets";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("Callback received:", { code: !!code, error, errorDescription });

 
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  
  if (code) {
    try {
      console.log("Attempting to exchange code for session...");
      
     
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        
        
        if (exchangeError.message?.includes('code verifier')) {
          return NextResponse.redirect(`${origin}/login?error=oauth_flow_error&message=OAuth flow interrupted. Please try signing in again.`);
        }
        
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`);
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.email);

        // Create or update profile
        try {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            console.log("Creating new profile for user");
            
            const username = 
              data.user.user_metadata?.preferred_username || // GitHub
              data.user.user_metadata?.user_name || 
              data.user.user_metadata?.name || 
              data.user.user_metadata?.full_name || 
              data.user.email?.split("@")[0] ||
              `user_${data.user.id.slice(0, 8)}`;

            const { error: profileError } = await supabase.from("profiles").insert({
              id: data.user.id,
              username: username,
              bio: "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });

            if (profileError) {
              console.warn("Profile creation failed:", profileError);
              // Don't fail the login just because profile creation failed
            } else {
              console.log("Profile created successfully");
            }
          } else {
            console.log("Profile already exists");
          }
        } catch (profileError) {
          console.warn("Profile operation failed:", profileError);
          // Don't fail the login just because profile operation failed
        }

        // Success - redirect to destination
        const redirectUrl = `${origin}${next}`;
        console.log("Redirecting to:", redirectUrl);
        
        const response = NextResponse.redirect(redirectUrl);
        
        // Set secure headers and clear cache
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      } else {
        console.error("No user data received after successful exchange");
        return NextResponse.redirect(`${origin}/login?error=no_user_data`);
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error&message=${encodeURIComponent(error.message)}`);
    }
  }

  // No code provided
  console.error("No authorization code provided");
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}