/**
 * EventPilot Domain Types
 * Strict typing for event profiles, budget items, tasks, vendors, ideas, and replanning proposals.
 */

export type EventType =
  | "birthday"
  | "wedding"
  | "community"
  | "corporate"
  | "anniversary"
  | "other";

export type VenueType = "indoor" | "outdoor" | "hybrid" | "unselected";

export type DietaryPreference =
  | "vegetarian"
  | "non-vegetarian"
  | "vegan"
  | "jain"
  | "halal"
  | "gluten-free"
  | "nut-allergy";

export type PlanningPriority =
  | "food"
  | "decor"
  | "photography"
  | "entertainment"
  | "venue"
  | "budget";

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

export type BudgetCategory =
  | "venue"
  | "food_beverage"
  | "decorations"
  | "photography"
  | "entertainment"
  | "invitations"
  | "transportation"
  | "miscellaneous"
  | "contingency_reserve";

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

export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: BudgetCategory | "general" | "coordination";
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

export type VendorCategory =
  | "venue"
  | "caterer"
  | "decorator"
  | "photographer"
  | "entertainment"
  | "transportation"
  | "invitations"
  | "other";

export type VendorBookingStatus =
  | "planned"
  | "contacted"
  | "quote_received"
  | "shortlisted"
  | "booked"
  | "cancelled";

export type VendorPaymentStatus = "unpaid" | "advance_paid" | "fully_paid";

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

export type CreativeIdeaCategory =
  | "theme"
  | "decor"
  | "menu"
  | "activities"
  | "invitation"
  | "return_gifts"
  | "schedule"
  | "weather_contingency";

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

export interface PlanChangeDiff {
  type: "budget" | "task" | "vendor" | "profile" | "preference";
  field: string;
  label: string;
  before: string | number;
  after: string | number;
  impactReason: string;
  isProtectedConflict?: boolean;
}

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
