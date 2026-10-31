import { NextRequest, NextResponse } from "next/server";
import { AIServiceError, executeReplanning } from "../../../../lib/ai/aiService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (
      typeof body.query !== "string" ||
      !body.query.trim() ||
      !body.plan ||
      typeof body.plan !== "object" ||
      Array.isArray(body.plan)
    ) {
      return NextResponse.json({ error: "Provide a replanning request and a valid event plan." }, { status: 400 });
    }
    return NextResponse.json(await executeReplanning(body.query, body.plan));
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to analyze the requested change.";
    return NextResponse.json({ error: message }, { status });
  }
}
