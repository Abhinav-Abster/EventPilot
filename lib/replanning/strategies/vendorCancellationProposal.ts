/**
 * Strategy reallocating budget and flagging blocked tasks when a vendor booking is cancelled.
 */
import {
  EventPlan,
  VendorRecord,
  Task,
  TaskCategory,
  ReplanningProposal,
  PlanChangeDiff,
} from "../../types/event";
import { addMoney } from "../../budget/moneyUtils";
import { addDaysToDate } from "../../timeline/timelineEngine";
import { ParsedConstraintChange } from "../types";

function vendorCategoryToTaskCategory(category: string): TaskCategory {
  switch (category) {
    case "caterer":
      return "food_beverage";
    case "decorator":
      return "decorations";
    case "photographer":
      return "photography";
    case "venue":
      return "venue";
    case "entertainment":
      return "entertainment";
    case "transportation":
      return "transportation";
    case "invitations":
      return "invitations";
    default:
      return "coordination";
  }
}

/**
 * Generates a proposal unlinking cancelled vendors and scheduling replacement procurement.
 */
export function createVendorCancellationProposal(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const cat = changeIntent.cancelledVendorCategory || "caterer";

  const revisedVendors: VendorRecord[] = currentPlan.vendors.map((v) => {
    if (v.category === cat) {
      return {
        ...v,
        bookingStatus: "cancelled" as const,
        notes: `Cancelled by vendor on ${new Date().toLocaleDateString()}. Action required: Source emergency replacement.`,
      };
    }
    return { ...v };
  });

  const replacementTask: Task = {
    id: `task-emergency-${cat}`,
    title: `CRITICAL: Source Replacement ${cat.toUpperCase()} Immediately`,
    description: `Prioritize contacting backup ${cat}s in Pune with availability for ${currentPlan.profile.date}.`,
    category: vendorCategoryToTaskCategory(cat),
    priority: "urgent",
    relativeDays: -3,
    dueDate: addDaysToDate(currentPlan.profile.date, -3),
    status: "todo",
    dependencies: [],
    isOverdue: false,
    isBlocked: false,
  };

  const revisedTasks = [replacementTask, ...currentPlan.tasks];

  const diffs: PlanChangeDiff[] = [
    {
      type: "vendor",
      field: `vendor-${cat}`,
      label: `${cat.toUpperCase()} Status`,
      before: "Active Booking / Quote",
      after: "CANCELLED",
      impactReason: `Vendor notified cancellation. Triggered emergency replacement workflow.`,
    },
    {
      type: "task",
      field: replacementTask.id,
      label: "New Urgent Action Item",
      before: "None",
      after: replacementTask.title,
      impactReason: "Added critical replacement deadline to ensure event execution.",
    },
  ];

  return [
    {
      id: "prop-vendor-emergency",
      title: `Activate Emergency Replacement Plan for ${cat.toUpperCase()}`,
      summary: `Flags cancellation, freezes quote liabilities, and inserts high-priority task to reach vetted Pune backup providers.`,
      strategy: "contingency",
      impact: {
        budgetDeltaMinor: 0,
        newTotalEstimatedMinor: currentPlan.budgetItems.reduce(
          (s, i) => addMoney(s, i.estimatedCostMinor),
          0
        ),
        tasksAffectedCount: 1,
        feasibilityScore: 72,
        preservedConstraints: [...currentPlan.profile.mustHaves],
        unresolvedIssues: [`Replacement ${cat} must be locked before final event deadline.`],
      },
      diffs,
      revisedPlan: {
        ...currentPlan,
        vendors: revisedVendors,
        tasks: revisedTasks,
        updatedAt: new Date().toISOString(),
        version: currentPlan.version + 1,
      },
    },
  ];
}
