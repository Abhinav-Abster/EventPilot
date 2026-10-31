import { DEFAULT_GEMINI_MODEL, getGeminiClient, GeminiConfigurationError } from "./geminiClient";

export class AIServiceError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "AIServiceError";
  }
}

export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; message?: string; code?: string };
  if (err.name === "RequestTimeoutError" || err.name === "TimeoutError") return true;
  if (err.code === "ETIMEDOUT") return true;
  if (typeof err.message === "string" && /timed?\s*out|timeout/i.test(err.message)) return true;
  return false;
}

export function providerError(error: unknown): AIServiceError {
  if (error instanceof GeminiConfigurationError) {
    return new AIServiceError(error.message, 503);
  }

  if (isTimeoutError(error)) {
    return new AIServiceError(
      "The AI service timed out while generating a response. Please try again with a more concise request.",
      504
    );
  }

  const message = error instanceof Error ? error.message : "Unknown provider error";
  return new AIServiceError(`Gemini request failed: ${message}`, 502);
}

export async function generateJson(prompt: string, timeoutMs = 45000): Promise<unknown> {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 8192,
        httpOptions: { timeout: timeoutMs },
      },
    });

    if (!response.text) {
      throw new AIServiceError("Gemini returned an empty response.");
    }

    try {
      return JSON.parse(response.text);
    } catch {
      throw new AIServiceError("Gemini returned invalid JSON. Please try again.");
    }
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw providerError(error);
  }
}
