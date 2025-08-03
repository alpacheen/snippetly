export interface AIExplanation {
  explanation: string;
  suggestions: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  keyPoints: string[];
}

export interface AIOptimization {
  optimizedCode: string;
  improvements: string[];
  reasoning: string;
}

export async function explainCode(
  code: string,
  language: string
): Promise<AIExplanation> {
  try {
    const response = await fetch("/api/ai/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI explanation error:", error);
    throw new Error("Failed to generate explanation");
  }
}

export async function optimizeCode(
  code: string,
  language: string
): Promise<AIOptimization> {
  try {
    const response = await fetch("/api/ai/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI optimization error:", error);
    throw new Error("Failed to optimize code");
  }
}

export async function generateTests(
  code: string,
  language: string
): Promise<{ tests: string; framework: string }> {
  try {
    const response = await fetch("/api/ai/generate-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI test generation error:", error);
    throw new Error("Failed to generate tests");
  }
}
