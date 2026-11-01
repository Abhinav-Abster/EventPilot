/**
 * Regex and rule-based intent parsers classifying natural-language replanning requests into structured constraint changes.
 */
import { EventPlan, BudgetCategory } from "../types/event";
import { formatINR, rupeesToPaise } from "../budget/moneyUtils";
import { addDaysToDate } from "../timeline/timelineEngine";
import { ParsedConstraintChange } from "./types";

/**
 * Extracts target budget limits from natural language input.
 */
export function parseBudgetIntent(q: string, query: string): ParsedConstraintChange | null {
  const budgetMatch =
    q.match(
      /(?:budget|spend|cost)\s*(?:is|now|to|=|reduced to)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|thousand)?/i
    ) ||
    q.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|thousand)?/i) ||
    q.match(/reduce\s*(?:to)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh)?/i);

  if (!budgetMatch) return null;

  const numStr = budgetMatch[1].replace(/,/g, "");
  let value = parseFloat(numStr);
  const multiplier = (budgetMatch[2] || "").toLowerCase();
  if (multiplier === "k" || multiplier === "thousand") value *= 1000;
  if (multiplier === "lakh") value *= 100000;

  if (value > 100 && value < 10000000) {
    return {
      changeType: "budget_change",
      rawQuery: query,
      targetBudgetMinor: rupeesToPaise(value),
      explanation: `User requested budget adjustment to ${formatINR(rupeesToPaise(value))}.`,
    };
  }
  return null;
}
function computeTargetGuestCount(rawVal: number, q: string, currentCount: number): number {
  const isAdditional =
    q.includes("additional") || q.includes("more") || q.includes("extra") || q.includes("add");
  const isLess = q.includes("less") || q.includes("fewer") || q.includes("decrease");

  if (isAdditional) return currentCount + rawVal;
  if (isLess) return Math.max(5, currentCount - rawVal);
  return rawVal;
}

/**
 * Extracts updated guest count figures from natural language input.
 */
export function parseGuestCountIntent(
  q: string,
  query: string,
  currentPlan: EventPlan
): ParsedConstraintChange | null {
  const guestMatch =
    q.match(/(\d+)\s*(?:additional|more|extra|new)\s*guests?/i) ||
    q.match(/(?:guests?|people|headcount)\s*(?:is|now|to)?\s*(\d+)/i) ||
    q.match(/(?:increase|decrease|add)\s*(?:guests?|people)\s*(?:by|to)?\s*(\d+)/i);

  if (!guestMatch) return null;

  const rawVal = parseInt(guestMatch[1], 10);
  const finalGuestCount = computeTargetGuestCount(rawVal, q, currentPlan.profile.guestCount);

  return {
    changeType: "guest_count_change",
    rawQuery: query,
    newGuestCount: finalGuestCount,
    explanation: `Guest count updated from ${currentPlan.profile.guestCount} to ${finalGuestCount}.`,
  };
}

/**
 * Identifies indoor/outdoor venue preference shifts from natural language input.
 */
export function parseVenueIntent(q: string, query: string): ParsedConstraintChange | null {
  if (
    q.includes("indoor") ||
    q.includes("inside") ||
    q.includes("rain") ||
    q.includes("weather bad")
  ) {
    return {
      changeType: "venue_change",
      rawQuery: query,
      newVenueType: "indoor",
      explanation:
        "Relocating celebration from outdoor lawn to indoor hall due to rain/preference.",
    };
  }
  if (q.includes("outdoor") || q.includes("lawn") || q.includes("terrace")) {
    return {
      changeType: "venue_change",
      rawQuery: query,
      newVenueType: "outdoor",
      explanation: "Switching venue to outdoor lawn setting.",
    };
  }
  return null;
}

const VENDOR_CANCELLATION_CONFIGS = [
  {
    keyword: "cater",
    category: "caterer",
    explanation:
      "Primary caterer cancelled reservation. Immediate replacement and menu review required.",
  },
  {
    keyword: "photo",
    category: "photographer",
    explanation: "Photographer cancelled booking.",
  },
  {
    keyword: "decor",
    category: "decorator",
    explanation: "Decorator cancelled booking.",
  },
] as const;

/**
 * Identifies vendor cancellation notifications and affected vendor categories.
 */
export function parseVendorCancellationIntent(
  q: string,
  query: string
): ParsedConstraintChange | null {
  const isCancellation =
    q.includes("cancel") || q.includes("backed out") || q.includes("unavailable");
  if (!isCancellation) return null;

  const match = VENDOR_CANCELLATION_CONFIGS.find((cfg) => q.includes(cfg.keyword));
  if (!match) return null;

  return {
    changeType: "vendor_cancellation",
    rawQuery: query,
    cancelledVendorCategory: match.category,
    explanation: match.explanation,
  };
}

/**
 * Extracts new target dates or relative postponement days from user requests.
 */
export function parseDateChangeIntent(
  q: string,
  query: string,
  currentPlan: EventPlan
): ParsedConstraintChange | null {
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
  const dateMatch = q.match(dateRegex);
  if (dateMatch) {
    return {
      changeType: "date_change",
      rawQuery: query,
      newDate: dateMatch[1],
      explanation: `Event rescheduled to ${dateMatch[1]}.`,
    };
  }
  if (q.includes("next saturday") || q.includes("next week") || q.includes("postpone")) {
    const shiftedDate = addDaysToDate(currentPlan.profile.date, 7);
    return {
      changeType: "date_change",
      rawQuery: query,
      newDate: shiftedDate,
      explanation: `Event postponed by 7 days to ${shiftedDate}.`,
    };
  }
  return null;
}

/**
 * Detects requests to cut specific categories or feature priorities.
 */
export function parsePriorityReductionIntent(
  q: string,
  query: string
): ParsedConstraintChange | null {
  if (q.includes("keep") && (q.includes("decor") || q.includes("food") || q.includes("photo"))) {
    const protectedCats: BudgetCategory[] = [];
    if (q.includes("decor")) protectedCats.push("decorations");
    if (q.includes("food")) protectedCats.push("food_beverage");
    if (q.includes("photo")) protectedCats.push("photography");

    return {
      changeType: "priority_reduction",
      rawQuery: query,
      protectedCategories: protectedCats,
      explanation: `Protecting ${protectedCats.join(
        ", "
      )} while trimming all other flexible expense categories.`,
    };
  }
  return null;
}
