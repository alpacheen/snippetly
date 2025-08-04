import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface OptimizeRequest {
  code: string;
  language: string;
}

export async function POST(req: NextRequest) {
  try {
    const { code, language }: OptimizeRequest = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json(
        { error: "AI optimization not available" },
        { status: 503 }
      );
    }

    const prompt = `Please optimize this ${language} code for better performance, readability, and best practices.

Code to optimize:
\`\`\`${language}
${code}
\`\`\`

Please respond with a JSON object containing:
{
  "optimizedCode": "The improved version of the code",
  "improvements": ["Array of specific improvements made"],
  "reasoning": "Brief explanation of why these changes improve the code"
}

Focus on: performance, readability, security, and ${language} best practices.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anthropicKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text;

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({
      optimizedCode: code,
      improvements: ["No specific optimizations suggested"],
      reasoning: "Code appears to be well-written already",
    });
  } catch (error) {
    console.error("AI optimize error:", error);
    return NextResponse.json(
      { error: "Failed to optimize code" },
      { status: 500 }
    );
  }
}
