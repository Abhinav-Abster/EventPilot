import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_CATEGORIES,
} from "../../types/event";
import { isOneOf } from "../../utils/guards";
import { addDaysToDate } from "../../timeline/timelineEngine";
import { asRecord, text, integer, signedInteger } from "../parsingHelpers";

function resolveTaskCategory(raw: unknown): TaskCategory {
  const str = text(raw, "general");
  return isOneOf(TASK_CATEGORIES, str) ? str : "general";
}

function resolveTaskPriority(raw: unknown): TaskPriority {
  const str = text(raw).toLowerCase();
  return isOneOf(TASK_PRIORITIES, str) ? str : "medium";
}

function resolveTaskStatus(raw: unknown): TaskStatus {
  const str = text(raw).toLowerCase();
  return isOneOf(TASK_STATUSES, str) ? str : "todo";
}

export function normalizeTasks(rawList: unknown[], planDate: string): Task[] {
  const fallbackList = [
    { title: "Confirm venue booking", category: "venue", relativeDays: -20 },
    { title: "Finalize menu and caterer", category: "catering", relativeDays: -14 },
    { title: "Send digital invitations", category: "invitations", relativeDays: -10 },
    { title: "Final checklist review", category: "general", relativeDays: -2 },
  ];

  const source = rawList.length > 0 ? rawList : fallbackList;
  return source.map((value, index) => {
    const task = asRecord(value) ?? {};
    const relativeDays = signedInteger(task.relativeDays ?? task.daysBeforeEvent, -7);

    return {
      id: text(task.id, `ai-task-${index + 1}`),
      title: text(task.title, `Planning task ${index + 1}`),
      description: text(task.description, "Complete this event-planning task."),
      category: resolveTaskCategory(task.category),
      priority: resolveTaskPriority(task.priority),
      relativeDays,
      dueDate: text(task.dueDate, addDaysToDate(planDate, relativeDays)),
      status: resolveTaskStatus(task.status),
      dependencies: Array.isArray(task.dependencies)
        ? task.dependencies.filter((d): d is string => typeof d === "string")
        : [],
      estimatedCostMinor:
        task.estimatedCostMinor != null ? integer(task.estimatedCostMinor) : undefined,
      vendorId:
        typeof task.vendorId === "string" && task.vendorId.trim()
          ? task.vendorId.trim()
          : undefined,
      isOverdue: typeof task.isOverdue === "boolean" ? task.isOverdue : false,
      isBlocked: typeof task.isBlocked === "boolean" ? task.isBlocked : false,
    };
  });
}
