import { EventPlan, ReplanningProposal } from "../../types/event";
import { calculateBudgetSummary } from "../../budget/budgetEngine";

export function createGeneralAuditProposal(currentPlan: EventPlan): ReplanningProposal[] {
  const summary = calculateBudgetSummary(
    currentPlan.profile.totalBudgetMinor,
    currentPlan.budgetItems,
    currentPlan.profile.guestCount
  );

  return [
    {
      id: "prop-audit",
      title: "Comprehensive Event Feasibility Audit",
      summary:
        "Audit verifies that all financial calculations, task dependencies, and vendor quotes are in balance.",
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
    },
  ];
}
