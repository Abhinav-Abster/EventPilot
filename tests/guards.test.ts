import { describe, it, expect } from "vitest";
import { isOneOf } from "../lib/utils/guards";

describe("isOneOf type guard", () => {
  const FRUITS = ["apple", "banana", "orange"] as const;

  it("returns true for matching members", () => {
    expect(isOneOf(FRUITS, "apple")).toBe(true);
    expect(isOneOf(FRUITS, "banana")).toBe(true);
    expect(isOneOf(FRUITS, "orange")).toBe(true);
  });

  it("returns false for non-matching strings", () => {
    expect(isOneOf(FRUITS, "grape")).toBe(false);
    expect(isOneOf(FRUITS, "")).toBe(false);
    expect(isOneOf(FRUITS, "APPLE")).toBe(false);
  });

  it("returns false for non-strings", () => {
    expect(isOneOf(FRUITS, 123)).toBe(false);
    expect(isOneOf(FRUITS, null)).toBe(false);
    expect(isOneOf(FRUITS, undefined)).toBe(false);
    expect(isOneOf(FRUITS, {})).toBe(false);
    expect(isOneOf(FRUITS, [])).toBe(false);
  });
});
