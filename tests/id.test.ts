import { describe, it, expect } from "vitest";
import { createId } from "../lib/utils/id";

describe("createId utility", () => {
  it("creates an id with the specified prefix", () => {
    const id = createId("test");
    expect(id.startsWith("test-")).toBe(true);
    expect(id.length).toBeGreaterThan("test-".length);
  });

  it("generates unique ids on consecutive invocations", () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId("ep")));
    expect(ids.size).toBe(50);
  });
});
