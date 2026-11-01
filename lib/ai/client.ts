/**
 * Client-side HTTP client invoking EventPilot API endpoints with abortable timeouts.
 */
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

function handleAIRequestError(
  error: unknown,
  timedOut: boolean,
  externalSignal?: AbortSignal
): never {
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
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AIRequestError(
      typeof payload.error === "string" ? payload.error : "The AI request failed. Please try again."
    );
  }
  return payload as T;
}

/**
 * Dispatches an HTTP POST request to an AI route with an automatic timeout abort signal.
 * @param path Relative API route path.
 * @param body JSON request payload.
 * @param externalSignal Optional external AbortSignal to cancel the request.
 * @param timeoutMs Timeout duration in milliseconds before aborting (default 60s).
 * @returns Parsed JSON response from the server.
 * @throws AIRequestError if network fails, status is non-OK, or timeout expires.
 */
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
    return await parseJsonResponse<T>(response);
  } catch (error) {
    return handleAIRequestError(error, timedOut, externalSignal);
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/**
 * Requests conversational intake parsing to extract structured profile fields from free-form text.
 * @param message Raw intake chat message from the user.
 * @param currentProfile Existing profile state to preserve and augment.
 * @param signal Optional AbortSignal to cancel the request.
 */
export function requestIntake(
  message: string,
  currentProfile: Partial<EventProfile>,
  signal?: AbortSignal
) {
  return requestAI<IntakeResult>("/api/ai/intake", { message, currentProfile }, signal);
}

/**
 * Requests complete plan synthesis based on the provided event profile.
 * @param profile Event profile parameters specifying constraints.
 * @param signal Optional AbortSignal to cancel the request.
 */
export function requestPlan(profile: Partial<EventProfile>, signal?: AbortSignal) {
  return requestAI<PlanGenerationResult>("/api/ai/plan", { profile }, signal);
}

/**
 * Dispatches a replanning request evaluating user query against the active plan.
 * @param query Natural language description of requested change.
 * @param plan Active EventPlan instance.
 * @param signal Optional AbortSignal to cancel the request.
 */
export function requestReplanning(query: string, plan: EventPlan, signal?: AbortSignal) {
  return requestAI<ReplanningResult>("/api/ai/replanning", { query, plan }, signal);
}
