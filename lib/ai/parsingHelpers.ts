/**
 * Defensive parsing primitives extracting typed values from potentially malformed LLM JSON objects.
 */
import { AIServiceError } from "./transport";

export type JsonRecord = Record<string, unknown>;

/**
 * Safely coerces an unknown value to a string-keyed record if it is a non-null object.
 */
export function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

/**
 * Coerces an unknown value into an array, returning an empty array if invalid.
 */
export function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new AIServiceError(`Gemini did not return a ${field} list. Please try again.`);
  }
  return value;
}

/**
 * Coerces an unknown value into a trimmed string, returning a fallback if empty or invalid.
 */
export function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/**
 * Coerces an unknown value into a non-negative integer within specified bounds.
 */
export function integer(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, Math.round(numberValue)) : fallback;
}

/**
 * Coerces an unknown value into a signed integer within specified bounds.
 */
export function signedInteger(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : fallback;
}
