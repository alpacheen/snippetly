import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log("Generate key endpoint called");
    
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Import the client supabase for auth
    const { supabase } = await import("@/lib/supabase");
    
    // Verify user with the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("Generating key for user:", user.id);

    // Generate a simpler API key that will work
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const apiKey = `snp_${timestamp}_${randomPart}_${user.id.substring(0, 8)}`;

    console.log("Generated API key:", apiKey.substring(0, 10) + "...");

    // Use admin client to update profile
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        api_key: apiKey,
        api_key_created_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      
      // Try to create profile if it doesn't exist
      if (updateError.code === 'PGRST116') {
        console.log("Profile doesn't exist, creating one");
        
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            api_key: apiKey,
            api_key_created_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("Profile creation error:", insertError);
          return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
          );
        }

        console.log("Profile created with API key");
        return NextResponse.json({ apiKey });
      }
      
      return NextResponse.json(
        { error: "Failed to save API key: " + updateError.message },
        { status: 500 }
      );
    }

    console.log("API key saved successfully");
    return NextResponse.json({ apiKey });
  } catch (err) {
    console.error("Unexpected error in generate-key:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}