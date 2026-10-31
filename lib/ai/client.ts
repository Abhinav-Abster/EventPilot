import type { EventPlan, EventProfile } from "../types/event";
import type { IntakeResult, PlanGenerationResult, ReplanningResult } from "./aiService";

export class AIRequestError extends Error {}

async function requestAI<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AIRequestError(typeof payload.error === "string" ? payload.error : "The AI request failed. Please try again.");
  }
  return payload as T;
}

export function requestIntake(message: string, currentProfile: Partial<EventProfile>) {
  return requestAI<IntakeResult>("/api/ai/intake", { message, currentProfile });
}

export function requestPlan(profile: Partial<EventProfile>) {
  return requestAI<PlanGenerationResult>("/api/ai/plan", { profile });
}

export function requestReplanning(query: string, plan: EventPlan) {
  return requestAI<ReplanningResult>("/api/ai/replanning", { query, plan });
}
