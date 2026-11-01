/**
 * Low-level Gemini API transport handling JSON schema execution, timeouts, and structured error responses.
 */
import { DEFAULT_GEMINI_MODEL, getGeminiClient, GeminiConfigurationError } from "./geminiClient";

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 502
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

/**
 * Determines whether an error was caused by a request timeout or abort signal.
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; message?: string; code?: string };
  if (err.name === "RequestTimeoutError" || err.name === "TimeoutError") return true;
  if (err.code === "ETIMEDOUT") return true;
  if (typeof err.message === "string" && /timed?\s*out|timeout/i.test(err.message)) return true;
  return false;
}

/**
 * Maps Google GenAI API error instances into user-friendly status codes and error messages.
 */
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

/**
 * Calls Gemini models to generate schema-constrained JSON with token budgeting and timeout protection.
 * @param client Initialized Google GenAI SDK client.
 * @param prompt User prompt text containing instructions and contextual data.
 * @param systemInstruction System instruction defining the persona and behavioral boundaries.
 * @param signal AbortSignal to cancel request on client abort or timeout.
 * @returns Raw text output guaranteed to match JSON schema structure.
 */
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
