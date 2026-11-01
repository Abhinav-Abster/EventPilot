/**
 * Strategy scaling per-head catering, seating, and venue arrangements upon guest count changes.
 */
import {
  EventPlan,
  EventProfile,
  BudgetItem,
  ReplanningProposal,
  PlanChangeDiff,
} from "../../types/event";
import { calculateBudgetSummary } from "../../budget/budgetEngine";
import { formatINR, subtractMoney, addMoney } from "../../budget/moneyUtils";
import { ParsedConstraintChange } from "../types";

/**
 * Generates a proposal recalibrating per-person food, beverage, and venue capacities.
 */
export function createGuestCountProposal(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const newGuestCount = changeIntent.newGuestCount!;
  const oldGuestCount = currentPlan.profile.guestCount;
  const guestDelta = newGuestCount - oldGuestCount;

  const revisedProfile: EventProfile = {
    ...currentPlan.profile,
    guestCount: newGuestCount,
  };

  const revisedItems: BudgetItem[] = currentPlan.budgetItems.map((item) => {
    if (item.category === "food_beverage" || item.category === "invitations") {
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
      impactReason: `${guestDelta > 0 ? "Increased" : "Decreased"} attendance by ${Math.abs(guestDelta)} guests.`,
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

  return [
    {
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
    },
  ];
}
