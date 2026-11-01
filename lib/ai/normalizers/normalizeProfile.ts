/**
 * Normalizes, coerces, and clamps raw event intake fields into a strictly validated EventProfile.
 */
import {
  EventProfile,
  EventType,
  VenueType,
  PlanningPriority,
  EVENT_TYPES,
  VENUE_TYPES,
  PLANNING_PRIORITIES,
} from "../../types/event";
import { addDaysToDate } from "../../timeline/timelineEngine";
import { normalizeDiets } from "../dietNormalizer";
import { DEFAULT_CITY, DEFAULT_DIETARY_PREFERENCES } from "../../config/constants";
import { isOneOf } from "../../utils/guards";

function parseEventType(rawType: unknown): EventType {
  const str = typeof rawType === "string" ? rawType.toLowerCase().trim() : "";
  for (const t of EVENT_TYPES) {
    if (str.includes(t)) return t;
  }
  return "other";
}

function parsePriorities(raw: unknown): PlanningPriority[] {
  const priorities: PlanningPriority[] = [];
  if (Array.isArray(raw)) {
    for (const pr of raw) {
      if (typeof pr === "string") {
        const trimmed = pr.toLowerCase().trim();
        if (isOneOf(PLANNING_PRIORITIES, trimmed)) {
          priorities.push(trimmed);
        }
      }
    }
  }
  return priorities.length > 0 ? priorities : ["food", "decor", "budget"];
}

function parseBudgetMinor(raw: unknown): number {
  const rawNum = typeof raw === "number" ? raw : Number(raw);
  let total = Number.isFinite(rawNum) ? Math.round(rawNum) : 4000000;
  if (total < 10000) {
    if (total > 0 && total < 1000) total *= 100;
    if (total < 10000) total = 10000;
  }
  return total;
}

function parseGuestCount(rawGuestCount: unknown): number {
  const rawNum = typeof rawGuestCount === "number" ? rawGuestCount : Number(rawGuestCount);
  return Number.isFinite(rawNum) ? Math.min(5000, Math.max(1, Math.round(rawNum))) : 50;
}

function parseLocation(rawLoc: unknown) {
  const loc = (rawLoc && typeof rawLoc === "object" ? rawLoc : {}) as Record<string, unknown>;
  const city = typeof loc.city === "string" && loc.city.trim() ? loc.city.trim() : DEFAULT_CITY;
  const rawVenue = typeof loc.venueType === "string" ? loc.venueType.toLowerCase() : "";
  const venueType: VenueType = isOneOf(VENUE_TYPES, rawVenue) ? rawVenue : "outdoor";
  const venueName =
    typeof loc.venueName === "string" && loc.venueName.trim() ? loc.venueName.trim() : undefined;

  return { city, venueType, venueName };
}

function parseStringList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
}

function parseEventDate(rawDate: unknown): string {
  return typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : addDaysToDate(new Date().toISOString().slice(0, 10), 30);
}

function parseProfileId(rawId: unknown): string {
  return typeof rawId === "string" && rawId
    ? rawId
    : "ep-" + Math.random().toString(36).substring(2, 9);
}

/**
 * Sanitizes and bounds intake parameters into a strictly validated EventProfile entity.
 * @param raw Untrusted raw profile record from LLM intake output.
 * @returns Validated EventProfile object.
 */
export function normalizeProfile(
  raw: Partial<EventProfile> | Record<string, unknown> | undefined
): EventProfile {
  const p = (raw || {}) as Record<string, unknown>;
  const sanitizedDiets = normalizeDiets(p.dietaryPreferences);

  return {
    id: parseProfileId(p.id),
    name:
      typeof p.name === "string" && p.name.trim().length >= 2 ? p.name.trim() : "Celebration Event",
    type: parseEventType(p.type),
    date: parseEventDate(p.date),
    time: typeof p.time === "string" && p.time.trim() ? p.time.trim() : "18:00",
    location: parseLocation(p.location),
    guestCount: parseGuestCount(p.guestCount),
    totalBudgetMinor: parseBudgetMinor(p.totalBudgetMinor),
    currency: "INR",
    theme: typeof p.theme === "string" && p.theme.trim() ? p.theme.trim() : "General Celebration",
    dietaryPreferences:
      sanitizedDiets.length > 0 ? sanitizedDiets : [...DEFAULT_DIETARY_PREFERENCES],
    accessibilityRequirements: parseStringList(p.accessibilityRequirements),
    mustHaves: parseStringList(p.mustHaves),
    excludedFeatures: parseStringList(p.excludedFeatures),
    priorities: parsePriorities(p.priorities),
    notes: typeof p.notes === "string" ? p.notes : "",
  };
}
