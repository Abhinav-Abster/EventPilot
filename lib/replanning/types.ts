/**
 * Domain types for constraint changes, proposal diffs, and trade-off assessments in replanning.
 */
import { BudgetCategory } from "../types/event";

export interface ParsedConstraintChange {
  changeType:
    | "budget_change"
    | "guest_count_change"
    | "venue_change"
    | "vendor_cancellation"
    | "date_change"
    | "priority_reduction"
    | "general_change";
  rawQuery: string;
  targetBudgetMinor?: number;
  newGuestCount?: number;
  newVenueType?: "indoor" | "outdoor" | "hybrid";
  cancelledVendorCategory?: string;
  cancelledVendorId?: string;
  newDate?: string;
  protectedCategories?: BudgetCategory[];
  explanation: string;
}
