import type { EventPlan, EventProfile } from "../types/event";
import type { IntakeResult, PlanGenerationResult, ReplanningResult } from "./aiService";

export class AIRequestError extends Error {
  constructor(
    message: string,
    public readonly isTimeout = false
  ) {
    super(message);
    this.name = "AIRequestError";
  }
}

export async function requestAI<T>(
  path: string,
  body: unknown,
  externalSignal?: AbortSignal,
  timeoutMs = 60000
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new AIRequestError("Request was cancelled.");
    }
    externalSignal.addEventListener("abort", onExternalAbort);
  }

  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new AIRequestError(
        typeof payload.error === "string"
          ? payload.error
          : "The AI request failed. Please try again."
      );
    }
    return payload as T;
  } catch (error) {
    if (timedOut) {
      throw new AIRequestError("The request timed out after 60 seconds. Please try again.", true);
    }
    if (externalSignal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new AIRequestError("Request was cancelled.");
    }
    if (error instanceof AIRequestError) throw error;
    throw new AIRequestError(
      error instanceof Error ? error.message : "The AI request failed. Please try again."
    );
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

export function requestIntake(
  message: string,
  currentProfile: Partial<EventProfile>,
  signal?: AbortSignal
) {
  return requestAI<IntakeResult>("/api/ai/intake", { message, currentProfile }, signal);
}

export function requestPlan(profile: Partial<EventProfile>, signal?: AbortSignal) {
  return requestAI<PlanGenerationResult>("/api/ai/plan", { profile }, signal);
}

export function requestReplanning(query: string, plan: EventPlan, signal?: AbortSignal) {
  return requestAI<ReplanningResult>("/api/ai/replanning", { query, plan }, signal);
}
