import { z } from "zod";
import { processEventIntake } from "../../../../lib/ai/aiService";
import { handleAIRoute } from "../../../../lib/api/handleAIRoute";
import { EventProfile } from "../../../../lib/types/event";

export const runtime = "nodejs";

const intakeSchema = z.object({
  message: z
    .string({ required_error: "Provide an event message and a valid current profile." })
    .trim()
    .min(1, { message: "Provide an event message and a valid current profile." }),
  currentProfile: z
    .custom<Partial<EventProfile>>(
      (val) => val === undefined || (typeof val === "object" && val !== null && !Array.isArray(val)),
      { message: "Provide an event message and a valid current profile." }
    )
    .optional(),
});

export const POST = handleAIRoute(intakeSchema, ({ message, currentProfile }) =>
  processEventIntake(message, currentProfile ?? {})
);
