/**
 * Core replanning engine evaluating constraint violations and coordinating proposal generation strategies.
 */
import { EventPlan, ReplanningProposal } from "../types/event";
import { ParsedConstraintChange } from "./types";
import {
  parseBudgetIntent,
  parseGuestCountIntent,
  parseVenueIntent,
  parseVendorCancellationIntent,
  parseDateChangeIntent,
  parsePriorityReductionIntent,
} from "./intentParsers";
import { createBudgetChangeProposal } from "./strategies/budgetProposal";
import { createGuestCountProposal } from "./strategies/guestCountProposal";
import { createVenueChangeProposal } from "./strategies/venueProposal";
import { createVendorCancellationProposal } from "./strategies/vendorCancellationProposal";
import { createDateChangeProposal } from "./strategies/dateChangeProposal";
import { createGeneralAuditProposal } from "./strategies/generalProposal";

export type { ParsedConstraintChange };

/**
 * Natural Language / Query parser for constraint adjustments
 * Extracts structured intents for the constraint-solving pipeline.
 */
export function parseConstraintIntent(
  query: string,
  currentPlan: EventPlan
): ParsedConstraintChange {
  const q = query.toLowerCase().trim();

  return (
    parseBudgetIntent(q, query) ||
    parseGuestCountIntent(q, query, currentPlan) ||
    parseVenueIntent(q, query) ||
    parseVendorCancellationIntent(q, query) ||
    parseDateChangeIntent(q, query, currentPlan) ||
    parsePriorityReductionIntent(q, query) || {
      changeType: "general_change",
      rawQuery: query,
      explanation: "Re-evaluating event feasibility based on updated requirements.",
    }
  );
}

/**
 * Core Adaptive Replanning Pipeline
 * Dispatches to modular strategy solvers based on changeIntent.
 */
export function generateReplanningProposals(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  switch (changeIntent.changeType) {
    case "budget_change":
      return createBudgetChangeProposal(currentPlan, changeIntent);
    case "guest_count_change":
      return createGuestCountProposal(currentPlan, changeIntent);
    case "venue_change":
      return createVenueChangeProposal(currentPlan, changeIntent);
    case "vendor_cancellation":
      return createVendorCancellationProposal(currentPlan, changeIntent);
    case "date_change":
      return createDateChangeProposal(currentPlan, changeIntent);
    default:
      return createGeneralAuditProposal(currentPlan);
  }
}
