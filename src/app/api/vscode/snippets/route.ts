import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create a new supabase client for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Search snippets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const apiKey = request.headers.get("x-api-key");

    console.log("=== Snippets GET Request ===");
    console.log(
      "API Key received:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "none"
    );
    console.log("Search query:", query);

    if (!apiKey) {
      console.log("No API key provided");
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // Log the query we're about to make
    console.log("Looking up profile with API key...");

    // Verify API key and get user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("api_key", apiKey)
      .single();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      console.error("Error code:", profileError.code);
      console.error("Error message:", profileError.message);

      // Check if it's a no rows error
      if (profileError.code === "PGRST116") {
        console.log("No profile found with this API key");

        // Let's check if any profiles exist with API keys
        const { data: anyProfiles, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .not("api_key", "is", null)
          .limit(1);

        console.log("Profiles with API keys exist:", !!anyProfiles?.length);
      }

      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (!profile) {
      console.log("No profile returned (but no error either)");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    console.log("Profile found:", profile.username, "ID:", profile.id);

    // Search snippets
    let snippetQuery = supabase
      .from("snippets")
      .select("id, title, description, code, language, tags")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (query) {
      snippetQuery = snippetQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    const { data: snippets, error: snippetsError } = await snippetQuery;

    if (snippetsError) {
      console.error("Snippets fetch error:", snippetsError);
      return NextResponse.json(
        { error: "Failed to fetch snippets" },
        { status: 500 }
      );
    }

    console.log("Snippets found:", snippets?.length || 0);
    return NextResponse.json({ snippets: snippets || [] });
  } catch (err) {
    console.error("Unexpected error in snippets GET:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST route remains the same but add similar logging...
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    console.log("=== Snippets POST Request ===");
    console.log(
      "API Key received:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "none"
    );

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("api_key", apiKey)
      .single();

    if (profileError || !profile) {
      console.error("Profile lookup error:", profileError);
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, code, language, tags } = body;

    console.log("Creating snippet for user:", profile.id);

    const { data: snippet, error: insertError } = await supabase
      .from("snippets")
      .insert({
        title,
        description: description || "",
        code,
        language,
        tags: tags || [],
        user_id: profile.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create snippet" },
        { status: 500 }
      );
    }

    console.log("Snippet created:", snippet.id);
    return NextResponse.json({ snippet });
  } catch (err) {
    console.error("Unexpected error in snippets POST:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
