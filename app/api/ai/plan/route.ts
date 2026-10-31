import { NextRequest, NextResponse } from "next/server";
import { AIServiceError, generateFullEventPlan } from "../../../../lib/ai/aiService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
      return NextResponse.json({ error: "Provide a valid event profile." }, { status: 400 });
    }
    return NextResponse.json(await generateFullEventPlan(body.profile));
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to generate the event plan.";
    return NextResponse.json({ error: message }, { status });
  }
}
