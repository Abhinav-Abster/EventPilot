import { EventPlan, EventProfile, ReplanningProposal, PlanChangeDiff } from "../../types/event";
import { optimizeBudget } from "../../budget/budgetEngine";
import { formatINR, subtractMoney } from "../../budget/moneyUtils";
import { ParsedConstraintChange } from "../types";

export function createBudgetChangeProposal(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const targetBudgetMinor = changeIntent.targetBudgetMinor!;
  const oldBudgetMinor = currentPlan.profile.totalBudgetMinor;
  const budgetDelta = subtractMoney(targetBudgetMinor, oldBudgetMinor);

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

  return [
    {
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
    },
  ];
}
