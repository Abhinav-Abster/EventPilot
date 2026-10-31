import { z } from "zod";
import { executeReplanning } from "../../../../lib/ai/aiService";
import { handleAIRoute } from "../../../../lib/api/handleAIRoute";
import { EventPlan } from "../../../../lib/types/event";

export const runtime = "nodejs";

const replanningSchema = z.object({
  query: z
    .string({ required_error: "Provide a replanning request and a valid event plan." })
    .trim()
    .min(1, { message: "Provide a replanning request and a valid event plan." }),
  plan: z.custom<EventPlan>(
    (val) => typeof val === "object" && val !== null && !Array.isArray(val),
    { message: "Provide a replanning request and a valid event plan." }
  ),
});

export const POST = handleAIRoute(replanningSchema, ({ query, plan }) =>
  executeReplanning(query, plan)
);
