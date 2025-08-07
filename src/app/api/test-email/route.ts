import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Testing email setup with:", email);

    // Test signup (this will send confirmation email)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: "temp123456", // Temporary password for testing
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback?next=/snippets`,
      },
    });

    if (error) {
      console.error("Email test error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data: {
        user: data.user?.email,
        needsConfirmation: !data.user?.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("Email test API error:", error);
    return NextResponse.json(
      { error: "Failed to test email" },
      { status: 500 }
    );
  }
}
