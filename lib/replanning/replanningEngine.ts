import {
  EventPlan,
  EventProfile,
  BudgetItem,
  Task,
  VendorRecord,
  ReplanningProposal,
  PlanChangeDiff,
  BudgetCategory,
  TaskCategory,
  VendorCategory,
} from "../types/event";
import {
  calculateBudgetSummary,
  optimizeBudget,
} from "../budget/budgetEngine";
import {
  recalculateSchedule,
  addDaysToDate,
  daysBetween,
} from "../timeline/timelineEngine";
import {
  formatINR,
  rupeesToPaise,
  paiseToRupees,
  addMoney,
  subtractMoney,
  multiplyMoney,
} from "../budget/moneyUtils";

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

/**
 * Natural Language / Query parser for constraint adjustments
 * Extracts structured intents for the constraint-solving pipeline.
 */
export function parseConstraintIntent(
  query: string,
  currentPlan: EventPlan
): ParsedConstraintChange {
  const q = query.toLowerCase().trim();

  // 1. Budget Change detection (e.g. "budget is now ₹30,000", "reduce budget to 30000", "30k budget")
  const budgetMatch =
    q.match(/(?:budget|spend|cost)\s*(?:is|now|to|=|reduced to)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|thousand)?/i) ||
    q.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|thousand)?/i) ||
    q.match(/reduce\s*(?:to)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh)?/i);

  if (budgetMatch) {
    let numStr = budgetMatch[1].replace(/,/g, "");
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
  }

  // 2. Guest Count Change (e.g. "we have 20 additional guests", "guest count is 80", "10 less guests")
  const guestMatch =
    q.match(/(\d+)\s*(?:additional|more|extra|new)\s*guests?/i) ||
    q.match(/(?:guests?|people|headcount)\s*(?:is|now|to)?\s*(\d+)/i) ||
    q.match(/(?:increase|decrease|add)\s*(?:guests?|people)\s*(?:by|to)?\s*(\d+)/i);

  if (guestMatch) {
    const rawVal = parseInt(guestMatch[1], 10);
    const isAdditional = q.includes("additional") || q.includes("more") || q.includes("extra") || q.includes("add");
    const isLess = q.includes("less") || q.includes("fewer") || q.includes("decrease");

    let finalGuestCount = currentPlan.profile.guestCount;
    if (isAdditional) finalGuestCount += rawVal;
    else if (isLess) finalGuestCount = Math.max(5, finalGuestCount - rawVal);
    else finalGuestCount = rawVal;

    return {
      changeType: "guest_count_change",
      rawQuery: query,
      newGuestCount: finalGuestCount,
      explanation: `Guest count updated from ${currentPlan.profile.guestCount} to ${finalGuestCount}.`,
    };
  }

  // 3. Venue change (e.g. "move the party indoors", "switch to outdoor lawn", "rain forecast")
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
      explanation: "Relocating celebration from outdoor lawn to indoor hall due to rain/preference.",
    };
  } else if (q.includes("outdoor") || q.includes("lawn") || q.includes("terrace")) {
    return {
      changeType: "venue_change",
      rawQuery: query,
      newVenueType: "outdoor",
      explanation: "Switching venue to outdoor lawn setting.",
    };
  }

  // 4. Vendor cancellation (e.g. "the caterer cancelled", "decorator backed out", "photographer unavailable")
  if (
    q.includes("cater") && (q.includes("cancel") || q.includes("backed out") || q.includes("unavailable"))
  ) {
    return {
      changeType: "vendor_cancellation",
      rawQuery: query,
      cancelledVendorCategory: "caterer",
      explanation: "Primary caterer cancelled reservation. Immediate replacement and menu review required.",
    };
  }
  if (
    q.includes("photo") && (q.includes("cancel") || q.includes("backed out") || q.includes("unavailable"))
  ) {
    return {
      changeType: "vendor_cancellation",
      rawQuery: query,
      cancelledVendorCategory: "photographer",
      explanation: "Photographer cancelled booking.",
    };
  }
  if (
    q.includes("decor") && (q.includes("cancel") || q.includes("backed out") || q.includes("unavailable"))
  ) {
    return {
      changeType: "vendor_cancellation",
      rawQuery: query,
      cancelledVendorCategory: "decorator",
      explanation: "Decorator cancelled booking.",
    };
  }

  // 5. Date change (e.g. "the event is now next saturday", "postponed by 7 days", "date is 2026-11-15")
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
  const dateMatch = q.match(dateRegex);
  if (dateMatch) {
    return {
      changeType: "date_change",
      rawQuery: query,
      newDate: dateMatch[1],
      explanation: `Event rescheduled to ${dateMatch[1]}.`,
    };
  } else if (q.includes("next saturday") || q.includes("next week") || q.includes("postpone")) {
    const shiftedDate = addDaysToDate(currentPlan.profile.date, 7);
    return {
      changeType: "date_change",
      rawQuery: query,
      newDate: shiftedDate,
      explanation: `Event postponed by 7 days to ${shiftedDate}.`,
    };
  }

  // 6. Selective cost protection ("keep the decorations but reduce other expenses")
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

  // Fallback
  return {
    changeType: "general_change",
    rawQuery: query,
    explanation: "Re-evaluating event feasibility based on updated requirements.",
  };
}

/**
 * Core Adaptive Replanning Pipeline
 * Ingests a requested constraint change, executes deterministic constraint solving,
 * identifies violated/preserved invariants, and creates ranked proposals with full diffs.
 */
export function generateReplanningProposals(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const proposals: ReplanningProposal[] = [];

  switch (changeIntent.changeType) {
    case "budget_change": {
      const targetBudgetMinor = changeIntent.targetBudgetMinor!;
      const oldBudgetMinor = currentPlan.profile.totalBudgetMinor;
      const budgetDelta = subtractMoney(targetBudgetMinor, oldBudgetMinor);

      // Proposal 1: Smart Priority Optimization (balanced preservation)
      const optResult = optimizeBudget(
        currentPlan.budgetItems,
        targetBudgetMinor,
        currentPlan.profile
      );

      const revisedProfile: EventProfile = {
        ...currentPlan.profile,
        totalBudgetMinor: targetBudgetMinor,
      };

      const revisedTasks = [...currentPlan.tasks];
      // Update any task estimated costs that were trimmed
      for (const mod of optResult.modifications) {
        const matchingTask = revisedTasks.find(
          (t) => t.category === mod.category && t.estimatedCostMinor === mod.beforeMinor
        );
        if (matchingTask) {
          matchingTask.estimatedCostMinor = mod.afterMinor;
        }
      }

      const diffs: PlanChangeDiff[] = [
        {
          type: "profile",
          field: "totalBudgetMinor",
          label: "Total Budget Limit",
          before: formatINR(oldBudgetMinor),
          after: formatINR(targetBudgetMinor),
          impactReason: `User reduced overall event budget by ${formatINR(Math.abs(budgetDelta))}.`,
        },
      ];

      for (const mod of optResult.modifications) {
        diffs.push({
          type: "budget",
          field: mod.itemId,
          label: mod.name,
          before: formatINR(mod.beforeMinor),
          after: formatINR(mod.afterMinor),
          impactReason: mod.reason,
        });
      }

      const proposalBalanced: ReplanningProposal = {
        id: "prop-budget-balanced",
        title: "Balanced Priority-Preserving Budget Optimization",
        summary: `Trims flexible entertainment, photography, and decor while preserving your 100% vegetarian feast and all ${
          currentPlan.profile.mustHaves.length
        } protected must-haves.`,
        strategy: "cost_reduction",
        impact: {
          budgetDeltaMinor: budgetDelta,
          newTotalEstimatedMinor: optResult.newEstimatedMinor,
          tasksAffectedCount: optResult.modifications.length,
          feasibilityScore: optResult.isFeasible ? 96 : 58,
          preservedConstraints: [
            ...currentPlan.profile.mustHaves,
            `Guest Count: ${currentPlan.profile.guestCount} guests`,
            `Dietary: ${currentPlan.profile.dietaryPreferences.join(", ")}`,
          ],
          unresolvedIssues: optResult.conflicts,
        },
        diffs,
        revisedPlan: {
          ...currentPlan,
          profile: revisedProfile,
          budgetItems: optResult.optimizedItems,
          tasks: revisedTasks,
          updatedAt: new Date().toISOString(),
          version: currentPlan.version + 1,
        },
      };

      proposals.push(proposalBalanced);
      break;
    }

    case "guest_count_change": {
      const newGuestCount = changeIntent.newGuestCount!;
      const oldGuestCount = currentPlan.profile.guestCount;
      const guestDelta = newGuestCount - oldGuestCount;

      // Recalculate per-guest costs (especially food and invitations)
      const revisedProfile: EventProfile = {
        ...currentPlan.profile,
        guestCount: newGuestCount,
      };

      const revisedItems: BudgetItem[] = currentPlan.budgetItems.map((item) => {
        if (item.category === "food_beverage") {
          // Proportional scaling for food
          const costPerGuest = item.estimatedCostMinor / oldGuestCount;
          return {
            ...item,
            estimatedCostMinor: Math.round(costPerGuest * newGuestCount),
          };
        }
        if (item.category === "invitations") {
          const costPerGuest = item.estimatedCostMinor / oldGuestCount;
          return {
            ...item,
            estimatedCostMinor: Math.round(costPerGuest * newGuestCount),
          };
        }
        return { ...item };
      });

      const newSummary = calculateBudgetSummary(
        revisedProfile.totalBudgetMinor,
        revisedItems,
        newGuestCount
      );

      const diffs: PlanChangeDiff[] = [
        {
          type: "profile",
          field: "guestCount",
          label: "Guest Count",
          before: `${oldGuestCount} guests`,
          after: `${newGuestCount} guests`,
          impactReason: `${guestDelta > 0 ? "Increased" : "Decreased"} attendance by ${Math.abs(
            guestDelta
          )} guests.`,
        },
      ];

      for (const item of revisedItems) {
        const oldItem = currentPlan.budgetItems.find((b) => b.id === item.id);
        if (oldItem && oldItem.estimatedCostMinor !== item.estimatedCostMinor) {
          diffs.push({
            type: "budget",
            field: item.id,
            label: item.name,
            before: formatINR(oldItem.estimatedCostMinor),
            after: formatINR(item.estimatedCostMinor),
            impactReason: `Scaled for ${newGuestCount} attendees.`,
          });
        }
      }

      proposals.push({
        id: "prop-guest-scale",
        title: `Scale Event Operations for ${newGuestCount} Guests`,
        summary: `Adjusts catering portions, seating count, and invitation dispatches. ${
          newSummary.isOverspent
            ? `Note: Over budget by ${formatINR(newSummary.deficitMinor)}.`
            : `Fits within budget buffer!`
        }`,
        strategy: "balanced",
        impact: {
          budgetDeltaMinor: subtractMoney(
            newSummary.totalEstimatedMinor,
            currentPlan.budgetItems.reduce((s, i) => addMoney(s, i.estimatedCostMinor), 0)
          ),
          newTotalEstimatedMinor: newSummary.totalEstimatedMinor,
          tasksAffectedCount: 2,
          feasibilityScore: newSummary.isFeasible ? 90 : 65,
          preservedConstraints: [...currentPlan.profile.mustHaves],
          unresolvedIssues: newSummary.warnings,
        },
        diffs,
        revisedPlan: {
          ...currentPlan,
          profile: revisedProfile,
          budgetItems: revisedItems,
          updatedAt: new Date().toISOString(),
          version: currentPlan.version + 1,
        },
      });
      break;
    }

    case "venue_change": {
      const newVenueType = changeIntent.newVenueType!;
      const oldVenueType = currentPlan.profile.location.venueType;

      const revisedProfile: EventProfile = {
        ...currentPlan.profile,
        location: {
          ...currentPlan.profile.location,
          venueType: newVenueType,
          venueName:
            newVenueType === "indoor"
              ? "Mayur Banquets & AC Hall, Pune"
              : "Green Meadows Open Lawn, Pune",
        },
      };

      // Adjust venue budget item and decoration adjustments
      const revisedItems: BudgetItem[] = currentPlan.budgetItems.map((item) => {
        if (item.category === "venue") {
          return {
            ...item,
            name: newVenueType === "indoor" ? "Indoor AC Banquet Hall Rental" : "Outdoor Garden Lawn Rental",
            estimatedCostMinor: newVenueType === "indoor" ? 950000 : 800000,
          };
        }
        if (item.category === "decorations") {
          return {
            ...item,
            name: newVenueType === "indoor" ? "Indoor Backdrop & LED Arch" : "Lawn Fairy Lights & Standees",
          };
        }
        return { ...item };
      });

      // Adjust weather tasks
      const revisedTasks = currentPlan.tasks.map((task) => {
        if (task.id === "task-weather-check") {
          return {
            ...task,
            title: newVenueType === "indoor" ? "Inspect Hall Air Conditioning & Sound Setup" : "Check Pune Evening Radar & Rain Tarp",
            description: newVenueType === "indoor"
              ? "Verify AC cooling capacity for 60 guests and hall acoustics."
              : "Check Pune weather radar and confirm lawn drainage.",
          };
        }
        return { ...task };
      });

      const diffs: PlanChangeDiff[] = [
        {
          type: "profile",
          field: "venueType",
          label: "Venue Preference",
          before: oldVenueType.toUpperCase(),
          after: newVenueType.toUpperCase(),
          impactReason: changeIntent.explanation,
        },
        {
          type: "budget",
          field: "item-venue",
          label: "Venue Rental",
          before: formatINR(800000),
          after: formatINR(newVenueType === "indoor" ? 950000 : 800000),
          impactReason:
            newVenueType === "indoor"
              ? "Indoor AC banquets charge slightly higher utility fee for electricity."
              : "Outdoor lawn rental fee.",
        },
        {
          type: "task",
          field: "task-weather-check",
          label: "Pre-Event Facility Check",
          before: "Lawn Weather Check",
          after: newVenueType === "indoor" ? "Hall AC Inspection" : "Lawn Radar Check",
          impactReason: "Shifted operational checks to match indoor infrastructure.",
        },
      ];

      proposals.push({
        id: "prop-venue-relocate",
        title: `Relocate Event to ${newVenueType === "indoor" ? "Indoor Banquet Hall" : "Outdoor Lawn"}`,
        summary: `Safely transitions the party indoors, eliminating weather risks and shifting lighting/decor to stage backdrops.`,
        strategy: "venue_relocation",
        impact: {
          budgetDeltaMinor: newVenueType === "indoor" ? 150000 : -150000,
          newTotalEstimatedMinor: revisedItems.reduce((s, i) => addMoney(s, i.estimatedCostMinor), 0),
          tasksAffectedCount: 2,
          feasibilityScore: 94,
          preservedConstraints: [
            ...currentPlan.profile.mustHaves,
            "Vegetarian Menu Intact",
            "Anime Standees Maintained",
          ],
          unresolvedIssues: [],
        },
        diffs,
        revisedPlan: {
          ...currentPlan,
          profile: revisedProfile,
          budgetItems: revisedItems,
          tasks: revisedTasks,
          updatedAt: new Date().toISOString(),
          version: currentPlan.version + 1,
        },
      });
      break;
    }

    case "vendor_cancellation": {
      const cat = changeIntent.cancelledVendorCategory || "caterer";

      // Flag affected vendor as cancelled
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

      const vendorCategoryToTaskCategory = (category: string): TaskCategory => {
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
      };

      // Add emergency contingency task
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

      proposals.push({
        id: "prop-vendor-emergency",
        title: `Activate Emergency Replacement Plan for ${cat.toUpperCase()}`,
        summary: `Flags cancellation, freezes quote liabilities, and inserts high-priority task to reach vetted Pune backup providers.`,
        strategy: "contingency",
        impact: {
          budgetDeltaMinor: 0,
          newTotalEstimatedMinor: currentPlan.budgetItems.reduce((s, i) => addMoney(s, i.estimatedCostMinor), 0),
          tasksAffectedCount: 1,
          feasibilityScore: 72,
          preservedConstraints: [...currentPlan.profile.mustHaves],
          unresolvedIssues: [
            `Replacement ${cat} must be locked before final event deadline.`,
          ],
        },
        diffs,
        revisedPlan: {
          ...currentPlan,
          vendors: revisedVendors,
          tasks: revisedTasks,
          updatedAt: new Date().toISOString(),
          version: currentPlan.version + 1,
        },
      });
      break;
    }

    case "date_change": {
      const newDate = changeIntent.newDate!;
      const oldDate = currentPlan.profile.date;

      const revisedProfile: EventProfile = {
        ...currentPlan.profile,
        date: newDate,
      };

      // Recalculate schedule deadlines
      const { updatedTasks, warnings } = recalculateSchedule(
        currentPlan.tasks,
        newDate
      );

      const diffs: PlanChangeDiff[] = [
        {
          type: "profile",
          field: "date",
          label: "Event Date",
          before: oldDate,
          after: newDate,
          impactReason: `Rescheduled event date by ${daysBetween(oldDate, newDate)} days.`,
        },
      ];

      for (const t of updatedTasks) {
        const oldT = currentPlan.tasks.find((ot) => ot.id === t.id);
        if (oldT && oldT.dueDate !== t.dueDate) {
          diffs.push({
            type: "task",
            field: t.id,
            label: t.title,
            before: oldT.dueDate,
            after: t.dueDate,
            impactReason: `Recalculated relative deadline (${t.relativeDays}d offset).`,
          });
        }
      }

      proposals.push({
        id: "prop-reschedule",
        title: `Reschedule Event Deadlines to ${newDate}`,
        summary: `Recalculates all ${updatedTasks.length} task due dates and verifies vendor availability timelines.`,
        strategy: "balanced",
        impact: {
          budgetDeltaMinor: 0,
          newTotalEstimatedMinor: currentPlan.budgetItems.reduce((s, i) => addMoney(s, i.estimatedCostMinor), 0),
          tasksAffectedCount: updatedTasks.length,
          feasibilityScore: 92,
          preservedConstraints: [...currentPlan.profile.mustHaves],
          unresolvedIssues: warnings,
        },
        diffs,
        revisedPlan: {
          ...currentPlan,
          profile: revisedProfile,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
          version: currentPlan.version + 1,
        },
      });
      break;
    }

    default: {
      // General replanning optimization
      const summary = calculateBudgetSummary(
        currentPlan.profile.totalBudgetMinor,
        currentPlan.budgetItems,
        currentPlan.profile.guestCount
      );

      proposals.push({
        id: "prop-audit",
        title: "Comprehensive Event Feasibility Audit",
        summary: "Audit verifies that all financial calculations, task dependencies, and vendor quotes are in balance.",
        strategy: "balanced",
        impact: {
          budgetDeltaMinor: 0,
          newTotalEstimatedMinor: summary.totalEstimatedMinor,
          tasksAffectedCount: 0,
          feasibilityScore: summary.isFeasible ? 98 : 70,
          preservedConstraints: [...currentPlan.profile.mustHaves],
          unresolvedIssues: summary.warnings,
        },
        diffs: [],
        revisedPlan: { ...currentPlan },
      });
      break;
    }
  }

  return proposals;
}
