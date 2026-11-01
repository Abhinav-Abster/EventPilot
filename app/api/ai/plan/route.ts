import { z } from "zod";
import { generateFullEventPlan } from "../../../../lib/ai/aiService";
import { handleAIRoute } from "../../../../lib/api/handleAIRoute";
import { EventProfile } from "../../../../lib/types/event";

export const runtime = "nodejs";

const planSchema = z.object({
  profile: z.custom<Partial<EventProfile>>(
    (val) => typeof val === "object" && val !== null && !Array.isArray(val),
    { message: "Provide a valid event profile." }
  ),
});

export const POST = handleAIRoute(planSchema, ({ profile }) => generateFullEventPlan(profile));
