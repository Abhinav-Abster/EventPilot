/**
 * Generates a unique identifier with a given prefix using crypto.randomUUID with fallback.
 */
export function createId(prefix: string): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}-${crypto.randomUUID().replace(/-/g, "").substring(0, 8)}`;
    }
  } catch {
    // fallback below
  }
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}
