/**
 * Type-guard helper checking whether an unknown value is an element of a readonly tuple/array.
 */
export function isOneOf<T extends string>(list: readonly T[], v: unknown): v is T {
  return typeof v === "string" && (list as readonly string[]).includes(v);
}
