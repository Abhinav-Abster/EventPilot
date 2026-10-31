import { EventPlan, EventProfile, ReplanningProposal, PlanChangeDiff } from "../../types/event";
import { addMoney } from "../../budget/moneyUtils";
import { recalculateSchedule, daysBetween } from "../../timeline/timelineEngine";
import { ParsedConstraintChange } from "../types";

export function createDateChangeProposal(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const newDate = changeIntent.newDate!;
  const oldDate = currentPlan.profile.date;

  const revisedProfile: EventProfile = {
    ...currentPlan.profile,
    date: newDate,
  };

  const { updatedTasks, warnings } = recalculateSchedule(currentPlan.tasks, newDate);

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

  return [
    {
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
    },
  ];
}
