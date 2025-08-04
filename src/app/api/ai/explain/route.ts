import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface ExplainRequest {
  code: string;
  language: string;
}

export async function POST(req: NextRequest) {
  try {
    const { code, language }: ExplainRequest = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    if (code.length > 8000) {
      return NextResponse.json(
        { error: "Code snippet too long (max 8000 characters)" },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      console.warn("ANTHROPIC_API_KEY not found, using mock response");
      return getMockResponse(code, language);
    }

    const prompt = `Please analyze this ${language} code snippet and provide educational insights.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please respond with a JSON object containing:
{
  "explanation": "A clear, educational explanation of what this code does (2-3 sentences)",
  "keyPoints": ["Array of 3-5 key concepts, patterns, or techniques used"],
  "suggestions": ["Array of 3-5 specific, actionable improvement suggestions"],
  "complexity": "beginner|intermediate|advanced"
}

Focus on being educational and helpful for developers learning ${language}. Avoid overly technical jargon.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anthropicKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Updated to latest model
        max_tokens: 1200,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return getMockResponse(code, language);
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text;

    if (!aiResponse) {
      console.error("No content in Anthropic response");
      return getMockResponse(code, language);
    }

    try {
      // Extract JSON from Claude's response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (
          parsed.explanation &&
          parsed.keyPoints &&
          parsed.suggestions &&
          parsed.complexity
        ) {
          return NextResponse.json(parsed);
        }
      }

      // If JSON parsing fails, create structured response from text
      return NextResponse.json({
        explanation:
          aiResponse.split("\n")[0] ||
          `This ${language} code demonstrates common programming patterns.`,
        keyPoints: [
          `Uses ${language} syntax and conventions`,
          "Demonstrates good code organization",
          "Follows readable programming style",
        ],
        suggestions: [
          "Consider adding comments for complex logic",
          "Add error handling where appropriate",
          "Consider breaking down large functions",
        ],
        complexity: "intermediate",
      });
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      return getMockResponse(code, language);
    }
  } catch (error) {
    console.error("AI explain error:", error);
  }
}

// Enhanced mock response function
function getMockResponse(code: string, language: string) {
  const lines = code.split("\n").length;
  const hasAsync = code.includes("async") || code.includes("await");
  const hasFunction = code.includes("function") || code.includes("=>");
  const hasLoop = code.includes("for") || code.includes("while");
  const hasConditional = code.includes("if") || code.includes("switch");

  const keyPoints = [`Written in ${language}`];
  const suggestions = ["Add comments to explain complex logic"];

  if (hasAsync) {
    keyPoints.push("Uses asynchronous programming patterns");
    suggestions.push("Add proper error handling for async operations");
  }

  if (hasFunction) {
    keyPoints.push("Demonstrates function definition and usage");
    suggestions.push("Consider adding JSDoc comments");
  }

  if (hasLoop) {
    keyPoints.push("Implements iteration logic");
    suggestions.push("Verify loop termination conditions");
  }

  if (hasConditional) {
    keyPoints.push("Uses conditional logic");
    suggestions.push("Consider edge cases in conditions");
  }

  keyPoints.push("Follows standard coding conventions");
  suggestions.push("Consider adding unit tests");

  const complexity =
    lines < 10 ? "beginner" : lines < 30 ? "intermediate" : "advanced";

  return NextResponse.json({
    explanation: `This ${language} code snippet demonstrates ${
      hasAsync ? "asynchronous" : "synchronous"
    } programming patterns and follows standard ${language} conventions.`,
    keyPoints: keyPoints.slice(0, 5),
    suggestions: suggestions.slice(0, 5),
    complexity,
  });
}
