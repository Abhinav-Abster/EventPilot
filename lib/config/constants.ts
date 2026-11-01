import { DietaryPreference, EventType } from "../types/event";

/**
 * Demo default city used as fallback when location is omitted in user intake.
 * Retained for backward compatibility with pre-configured reference events.
 */
export const DEFAULT_CITY = "Pune";

/**
 * Demo default dietary preferences used when unspecified during profile creation.
 */
export const DEFAULT_DIETARY_PREFERENCES: readonly DietaryPreference[] = ["vegetarian"] as const;

/**
 * Canonical list of supported event types across all modules and schemas.
 */
export const ALL_EVENT_TYPES: readonly EventType[] = [
  "birthday",
  "wedding",
  "community",
  "corporate",
  "anniversary",
  "other",
] as const;
