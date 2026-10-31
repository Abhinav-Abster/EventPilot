import { NextRequest, NextResponse } from "next/server";
import { ZodType } from "zod";
import { AIServiceError } from "../ai/aiService";

export function handleAIRoute<T>(
  schema: ZodType<T>,
  handler: (data: T) => Promise<unknown>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage =
        parsed.error.errors[0]?.message || "Invalid request payload.";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    try {
      const result = await handler(parsed.data);
      return NextResponse.json(result);
    } catch (error) {
      const status = error instanceof AIServiceError ? error.status : 500;
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ error: message }, { status });
    }
  };
}
