/**
 * Singleton Google GenAI client factory and model configuration for server-side generation.
 */
import { GoogleGenAI } from "@google/genai";

let geminiClientInstance: GoogleGenAI | null = null;

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

/**
 * Singleton factory for Google GenAI SDK client
 * Following gemini-api-best-practices
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiConfigurationError(
      "Gemini is not configured. Set GEMINI_API_KEY in your server environment and restart EventPilot."
    );
  }

  if (!geminiClientInstance) {
    try {
      geminiClientInstance = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
      throw new GeminiConfigurationError(
        "Gemini could not be initialized. Check GEMINI_API_KEY and restart EventPilot."
      );
    }
  }

  return geminiClientInstance;
}

/**
 * Default Gemini model identifier used for structured schema-guided event generation.
 */
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
