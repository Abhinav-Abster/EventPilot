/**
 * EventPilot Domain Types
 * Strict typing for event profiles, budget items, tasks, vendors, ideas, and replanning proposals.
 */

/** Canonical list of supported event types. */
export const EVENT_TYPES = [
  "birthday",
  "wedding",
  "community",
  "corporate",
  "anniversary",
  "other",
] as const;

/** Recognized event category type. */
export type EventType = (typeof EVENT_TYPES)[number];

/** Canonical list of supported event venue environments. */
export const VENUE_TYPES = ["indoor", "outdoor", "hybrid", "unselected"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

/** Dietary preference categories supported in catering plans. */
export type DietaryPreference =
  "vegetarian" | "non-vegetarian" | "vegan" | "jain" | "halal" | "gluten-free" | "nut-allergy";

/** Core priority dimensions considered during trade-off negotiations. */
export const PLANNING_PRIORITIES = [
  "food",
  "decor",
  "photography",
  "entertainment",
  "venue",
  "budget",
] as const;

/** Priority classification for event planning categories. */
export type PlanningPriority = (typeof PLANNING_PRIORITIES)[number];

/** Core event profile entity containing high-level parameters and constraints. */
export interface EventProfile {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: {
    city: string;
    venueType: VenueType;
    venueName?: string;
  };
  guestCount: number;
  totalBudgetMinor: number; // in Paise (1 INR = 100 Paise)
  currency: "INR";
  theme: string;
  dietaryPreferences: DietaryPreference[];
  accessibilityRequirements: string[];
  mustHaves: string[]; // Protected non-negotiable requirements
  excludedFeatures: string[]; // Explicitly excluded items
  priorities: PlanningPriority[];
  notes: string;
}

/** Canonical list of budget expenditure categories. */
export const BUDGET_CATEGORIES = [
  "venue",
  "food_beverage",
  "decorations",
  "photography",
  "entertainment",
  "invitations",
  "transportation",
  "miscellaneous",
  "contingency_reserve",
] as const;

/** Expenditure category identifier for budget line items. */
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

/** Individual line-item expenditure entry in an event budget. */
export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCostMinor: number; // Paise
  actualCostMinor: number; // Paise
  flexible: boolean; // Can be reduced/substituted in budget optimization
  isProtected?: boolean; // Protected requirement (cannot be removed)
  notes?: string;
}

/** Comprehensive financial summary calculated across all budget categories. */
export interface BudgetSummary {
  totalBudgetMinor: number;
  totalEstimatedMinor: number;
  totalActualMinor: number;
  remainingEstimatedMinor: number;
  remainingActualMinor: number;
  contingencyMinor: number;
  contingencyPercent: number;
  isOverspent: boolean;
  deficitMinor: number;
  isFeasible: boolean;
  categoryBreakdown: Record<
    BudgetCategory,
    {
      estimatedMinor: number;
      actualMinor: number;
      count: number;
      percentageOfBudget: number;
    }
  >;
  warnings: string[];
  savingsTips: string[];
}

/** Priority levels assigned to preparation milestone tasks. */
export const TASK_PRIORITIES = ["urgent", "high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** Lifecycle states of a milestone task. */
export const TASK_STATUSES = ["todo", "in_progress", "completed", "blocked"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Categories classifying milestone tasks. */
export const TASK_CATEGORIES = [...BUDGET_CATEGORIES, "general", "coordination"] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  relativeDays: number; // Offset relative to event date: e.g. -21 (21 days prior)
  dueDate: string; // Computed ISO date YYYY-MM-DD
  status: TaskStatus;
  dependencies: string[]; // Array of task IDs that must be completed first
  estimatedCostMinor?: number;
  vendorId?: string;
  isOverdue: boolean;
  isBlocked: boolean;
}

/** Specialization categories classifying external vendors. */
export const VENDOR_CATEGORIES = [
  "venue",
  "caterer",
  "decorator",
  "photographer",
  "entertainment",
  "transportation",
  "invitations",
  "other",
] as const;
/** Category identifier for professional vendor services. */
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

/** Engagement lifecycle stages for a vendor. */
export const VENDOR_BOOKING_STATUSES = [
  "planned",
  "contacted",
  "quote_received",
  "shortlisted",
  "booked",
  "cancelled",
] as const;

/** Booking stage lifecycle classification for vendors. */
export type VendorBookingStatus = (typeof VENDOR_BOOKING_STATUSES)[number];

/** Payment status tracking vendor invoices and deposits. */
export const VENDOR_PAYMENT_STATUSES = ["unpaid", "advance_paid", "fully_paid"] as const;

/** Payment fulfillment stage for vendor services. */
export type VendorPaymentStatus = (typeof VENDOR_PAYMENT_STATUSES)[number];

/** Vendor engagement profile and financial tracking record. */
export interface VendorRecord {
  id: string;
  name: string;
  category: VendorCategory;
  contact: {
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  estimatedQuoteMinor: number;
  actualQuoteMinor: number;
  bookingStatus: VendorBookingStatus;
  paymentStatus: VendorPaymentStatus;
  notes: string;
  relatedTaskIds: string[];
}

/** Categorization buckets for personalized event suggestions. */
export const CREATIVE_IDEA_CATEGORIES = [
  "theme",
  "decor",
  "menu",
  "activities",
  "invitation",
  "return_gifts",
  "schedule",
  "weather_contingency",
] as const;

/** Category classification for creative inspiration suggestions. */
export type CreativeIdeaCategory = (typeof CREATIVE_IDEA_CATEGORIES)[number];

/** Creative thematic or operational recommendation tailored to event constraints. */
export interface CreativeIdea {
  id: string;
  category: CreativeIdeaCategory;
  title: string;
  description: string;
  whyItFits: string;
  estimatedCostMinor: number;
  costRangeText?: string;
  implementationSteps: string[];
  constraints: string[];
  tradeOffs: string[];
  isSaved?: boolean;
}

/** Granular delta describing a specific change applied during plan revision. */
export interface PlanChangeDiff {
  type: "budget" | "task" | "vendor" | "profile" | "preference";
  field: string;
  label: string;
  before: string | number;
  after: string | number;
  impactReason: string;
  isProtectedConflict?: boolean;
}

/** Evaluated replanning proposal presenting trade-offs and diffs against the active plan. */
export interface ReplanningProposal {
  id: string;
  title: string;
  summary: string;
  strategy: "balanced" | "cost_reduction" | "venue_relocation" | "contingency";
  impact: {
    budgetDeltaMinor: number;
    newTotalEstimatedMinor: number;
    tasksAffectedCount: number;
    feasibilityScore: number; // 0 - 100
    preservedConstraints: string[];
    unresolvedIssues: string[];
  };
  diffs: PlanChangeDiff[];
  revisedPlan: EventPlan;
}

/** Complete canonical event plan containing profile, budget, timeline, vendors, and ideas. */
export interface EventPlan {
  profile: EventProfile;
  budgetItems: BudgetItem[];
  tasks: Task[];
  vendors: VendorRecord[];
  ideas: CreativeIdea[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
