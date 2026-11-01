/**
 * Browser localStorage persistence manager with legacy schema migration and error recovery.
 */
import { EventPlan } from "../types/event";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { createReferenceEventPlan } from "./defaultEvent";
import { logger } from "../utils/logger";

/**
 * localStorage key under which the collection of event plans is persisted.
 */
export const STORAGE_EVENTS_KEY = "eventpilot_events_v2";
/**
 * localStorage key holding the identifier of the currently selected event plan.
 */
export const STORAGE_ACTIVE_ID_KEY = "eventpilot_active_event_id";
/**
 * Legacy localStorage key checked for backward-compatible migration of single-event plans.
 */
export const LEGACY_STORAGE_KEY = "eventpilot_active_plan_v2";

function parsePlansCollection(raw: string | null): EventPlan[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const validPlans: EventPlan[] = [];
    for (const item of parsed) {
      const validated = EventPlanSchema.safeParse(item);
      if (validated.success) {
        validPlans.push(validated.data as EventPlan);
      }
    }
    return validPlans;
  } catch (e) {
    logger.warn("Failed to parse stored events collection:", e);
    return [];
  }
}

function migrateLegacyPlan(legacyStored: string | null): EventPlan | null {
  if (!legacyStored) return null;
  try {
    const parsed = JSON.parse(legacyStored);
    const validated = EventPlanSchema.safeParse(parsed);
    if (validated.success) {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // ignore cleanup error
      }
      return validated.data as EventPlan;
    }
  } catch (e) {
    logger.warn("Failed to parse legacy stored plan:", e);
  }
  return null;
}

/**
 * Retrieves and validates event plans from browser localStorage with corruption fallback.
 */
export function loadStoredPlans(): { loadedPlans: EventPlan[]; activeId: string } {
  try {
    const storedEvents = localStorage.getItem(STORAGE_EVENTS_KEY);
    const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);

    let loadedPlans = parsePlansCollection(storedEvents);

    if (loadedPlans.length === 0) {
      const legacyPlan = migrateLegacyPlan(localStorage.getItem(LEGACY_STORAGE_KEY));
      if (legacyPlan) {
        loadedPlans = [legacyPlan];
      }
    }

    if (loadedPlans.length === 0) {
      loadedPlans.push(createReferenceEventPlan());
    }

    const activeId =
      storedActiveId && loadedPlans.some((p) => p.profile.id === storedActiveId)
        ? storedActiveId
        : loadedPlans[0].profile.id;

    return { loadedPlans, activeId };
  } catch (e) {
    logger.error("Failed to load plans from localStorage, using fallback:", e);
    const fallback = createReferenceEventPlan();
    return { loadedPlans: [fallback], activeId: fallback.profile.id };
  }
}

/**
 * Serializes event plans to browser localStorage safely.
 */
export function saveStoredPlans(plans: EventPlan[], activeId: string): void {
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(plans));
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeId);
  } catch (e) {
    logger.error("Failed to persist events to localStorage:", e);
  }
}
