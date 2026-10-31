import { NextRequest, NextResponse } from "next/server";
import { AIServiceError, processEventIntake } from "../../../../lib/ai/aiService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (
      typeof body.message !== "string" ||
      !body.message.trim() ||
      (body.currentProfile !== undefined &&
        (typeof body.currentProfile !== "object" || Array.isArray(body.currentProfile)))
    ) {
      return NextResponse.json({ error: "Provide an event message and a valid current profile." }, { status: 400 });
    }
    return NextResponse.json(await processEventIntake(body.message, body.currentProfile ?? {}));
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to process the event details.";
    return NextResponse.json({ error: message }, { status });
  }
}
