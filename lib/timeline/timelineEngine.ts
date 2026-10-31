import { Task, TaskPriority, TaskStatus } from "../types/event";
import { PriorityQueue } from "../utils/priorityQueue";
import { parseISODate, formatISODate, addDaysToDate, daysBetween } from "./dateUtils";
import { buildDefaultTasks } from "./defaultTasks";

export { parseISODate, formatISODate, addDaysToDate, daysBetween };

/**
 * Detects circular dependencies in task graph using Depth First Search (Cycle detection)
 */
export function detectCircularDependencies(tasks: Task[]): {
  hasCycle: boolean;
  cycleTaskIds: string[];
} {
  const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];
  let detectedCycle: string[] = [];

  function dfs(taskId: string): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);
    currentPath.push(taskId);

    const task = taskMap.get(taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId)) return true;
        } else if (recursionStack.has(depId)) {
          detectedCycle = [...currentPath, depId];
          return true;
        }
      }
    }

    currentPath.pop();
    recursionStack.delete(taskId);
    return false;
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (dfs(task.id)) {
        return { hasCycle: true, cycleTaskIds: detectedCycle };
      }
    }
  }

  return { hasCycle: false, cycleTaskIds: [] };
}

/**
 * Topologically sorts tasks while respecting dependencies and relative urgency
 */
export function sortTasksByExecutionOrder(tasks: Task[]): Task[] {
  const { hasCycle } = detectCircularDependencies(tasks);
  if (hasCycle) {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const t of tasks) {
    inDegree.set(t.id, 0);
    dependents.set(t.id, []);
  }

  for (const t of tasks) {
    for (const depId of t.dependencies) {
      if (dependents.has(depId)) {
        dependents.get(depId)!.push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
    }
  }

  const queue = new PriorityQueue<Task>((a, b) => a.dueDate.localeCompare(b.dueDate));
  for (const t of tasks) {
    if ((inDegree.get(t.id) || 0) === 0) {
      queue.push(t);
    }
  }

  const sorted: Task[] = [];
  const sortedIds = new Set<string>();

  while (!queue.isEmpty()) {
    const current = queue.pop()!;
    sorted.push(current);
    sortedIds.add(current.id);

    const children = dependents.get(current.id) || [];
    for (const childId of children) {
      inDegree.set(childId, (inDegree.get(childId) || 1) - 1);
      if (inDegree.get(childId) === 0) {
        const childTask = taskMap.get(childId);
        if (childTask) queue.push(childTask);
      }
    }
  }

  for (const t of tasks) {
    if (!sortedIds.has(t.id)) {
      sorted.push(t);
      sortedIds.add(t.id);
    }
  }

  return sorted;
}

/**
 * Recalculates task due dates, blocked status, and overdue flags
 * whenever the event date or task statuses change.
 */
export function recalculateSchedule(
  tasks: Task[],
  eventDateStr: string,
  currentDateStr?: string
): {
  updatedTasks: Task[];
  hasWarnings: boolean;
  warnings: string[];
} {
  const today = currentDateStr || formatISODate(new Date());
  const warnings: string[] = [];

  const daysUntilEvent = daysBetween(today, eventDateStr);
  const isLastMinute = daysUntilEvent >= 0 && daysUntilEvent <= 3;

  if (daysUntilEvent < 0) {
    warnings.push("The event date is in the past. Deadlines may be overdue.");
  } else if (daysUntilEvent < 7) {
    warnings.push(
      `Event is only ${daysUntilEvent} day(s) away! Timelines have been compressed to prioritize critical bookings immediately.`
    );
  }

  const completedTaskIds = new Set(
    tasks.filter((t) => t.status === "completed").map((t) => t.id)
  );

  const updatedTasks: Task[] = tasks.map((task) => {
    let effectiveRelativeDays = task.relativeDays;

    if (isLastMinute && effectiveRelativeDays < -daysUntilEvent) {
      effectiveRelativeDays = -daysUntilEvent;
    }

    let calculatedDueDate = addDaysToDate(eventDateStr, effectiveRelativeDays);
    if (isLastMinute && calculatedDueDate.localeCompare(today) < 0) {
      calculatedDueDate = today;
    }

    const hasUnmetDependencies = (task.dependencies || []).some(
      (depId) => !completedTaskIds.has(depId)
    );

    const isBlocked = hasUnmetDependencies && task.status !== "completed";
    const isOverdue =
      task.status !== "completed" && calculatedDueDate.localeCompare(today) < 0;

    let priority: TaskPriority = task.priority;
    if (isOverdue) {
      priority = "urgent";
    } else if (
      task.status !== "completed" &&
      daysBetween(today, calculatedDueDate) <= 2 &&
      priority !== "urgent"
    ) {
      priority = "high";
    }

    let status: TaskStatus = task.status;
    if (isBlocked && status === "todo") {
      status = "blocked";
    } else if (!isBlocked && status === "blocked") {
      status = "todo";
    }

    return {
      ...task,
      relativeDays: effectiveRelativeDays,
      dueDate: calculatedDueDate,
      isBlocked,
      isOverdue,
      priority,
      status,
    };
  });

  return {
    updatedTasks: sortTasksByExecutionOrder(updatedTasks),
    hasWarnings: warnings.length > 0,
    warnings,
  };
}

/**
 * Generates default tasks tailored to an event profile and venue.
 */
export function generateDefaultTasks(eventDateStr: string, isOutdoor: boolean): Task[] {
  return buildDefaultTasks(eventDateStr, isOutdoor, recalculateSchedule);
}
