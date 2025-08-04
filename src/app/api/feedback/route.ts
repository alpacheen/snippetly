import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface FeedbackRequest {
  feedback: string;
  rating?: number;
  email?: string;
  url: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { feedback, rating, email, url, timestamp } = body;

    // Validate input
    if (!feedback || feedback.trim().length < 5) {
      return NextResponse.json(
        { error: "Feedback must be at least 5 characters" },
        { status: 400 }
      );
    }

    // For now, just log to console. Later, you can save to database or send to email
    console.log("📧 New Feedback Received:", {
      feedback: feedback.trim(),
      rating,
      email: email || "anonymous",
      url,
      timestamp,
      userAgent: request.headers.get("user-agent"),
    });

    // TODO: Save to database or send email notification
    // You could use Supabase, send to Discord webhook, or email service

    return NextResponse.json({
      success: true,
      message: "Feedback received successfully",
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
