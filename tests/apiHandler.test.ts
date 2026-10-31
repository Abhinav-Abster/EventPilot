import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { NextRequest } from "next/server";
import { handleAIRoute } from "../lib/api/handleAIRoute";
import { AIServiceError } from "../lib/ai/aiService";

describe("handleAIRoute", () => {
  const testSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    count: z.number().positive({ message: "Count must be positive." }),
  });

  const mockHandler = vi.fn().mockImplementation(async (data: { name: string; count: number }) => {
    return { success: true, processedName: data.name.toUpperCase(), total: data.count * 2 };
  });

  const routeHandler = handleAIRoute(testSchema, mockHandler);

  it("handles valid JSON body and returns 200 with response", async () => {
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "Birthday", count: 10 }),
    });

    const res = await routeHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, processedName: "BIRTHDAY", total: 20 });
    expect(mockHandler).toHaveBeenCalledWith({ name: "Birthday", count: 10 });
  });

  it("returns 400 when request body contains invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: "{ invalid json ...",
    });

    const res = await routeHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid JSON in request body." });
  });

  it("returns 400 when schema validation fails", async () => {
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "", count: -5 }),
    });

    const res = await routeHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(typeof json.error).toBe("string");
  });

  it("maps AIServiceError status codes and messages (e.g., 504 Gateway Timeout)", async () => {
    const failingHandler = vi.fn().mockImplementation(async () => {
      throw new AIServiceError("Upstream timeout from model", 504);
    });

    const failingRoute = handleAIRoute(testSchema, failingHandler);
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "Test", count: 1 }),
    });

    const res = await failingRoute(req);
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json).toEqual({ error: "Upstream timeout from model" });
  });

  it("maps general Error to status 500", async () => {
    const errorHandler = vi.fn().mockImplementation(async () => {
      throw new Error("Unexpected crash");
    });

    const errorRoute = handleAIRoute(testSchema, errorHandler);
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "Test", count: 1 }),
    });

    const res = await errorRoute(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Unexpected crash" });
  });
});
