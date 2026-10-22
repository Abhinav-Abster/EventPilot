import { Task, TaskPriority, TaskStatus } from "../types/event";

/**
 * Parses YYYY-MM-DD to a local Date object without UTC timezone drift
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds or subtracts days from a date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

/**
 * Calculates day difference between two date strings (target - base)
 */
export function daysBetween(baseDateStr: string, targetDateStr: string): number {
  const base = parseISODate(baseDateStr);
  const target = parseISODate(targetDateStr);
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

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
  let detectedCycle: string[] = [];

  function dfs(taskId: string, path: string[]): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);
    const currentPath = [...path, taskId];

    const task = taskMap.get(taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId, currentPath)) return true;
        } else if (recursionStack.has(depId)) {
          detectedCycle = [...currentPath, depId];
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (dfs(task.id, [])) {
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
    // If cycle detected, fallback to sorting by dueDate and priority
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

  // Queue tasks with 0 dependencies
  const queue: Task[] = tasks
    .filter((t) => (inDegree.get(t.id) || 0) === 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const sorted: Task[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const children = dependents.get(current.id) || [];
    for (const childId of children) {
      inDegree.set(childId, (inDegree.get(childId) || 1) - 1);
      if (inDegree.get(childId) === 0) {
        const childTask = taskMap.get(childId);
        if (childTask) queue.push(childTask);
      }
    }
    queue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  // If any unvisited remaining (e.g. broken node) append them
  for (const t of tasks) {
    if (!sorted.some((s) => s.id === t.id)) {
      sorted.push(t);
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

  // Check how many days remaining until event
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
    // Determine effective relative day offset
    let effectiveRelativeDays = task.relativeDays;

    // For last-minute events, scale negative relative days so due date is not in the past
    if (isLastMinute && effectiveRelativeDays < -daysUntilEvent) {
      effectiveRelativeDays = -daysUntilEvent;
    }

    let calculatedDueDate = addDaysToDate(eventDateStr, effectiveRelativeDays);
    if (isLastMinute && calculatedDueDate.localeCompare(today) < 0) {
      calculatedDueDate = today;
    }

    // Check if task is blocked by incomplete dependencies
    const hasUnmetDependencies = (task.dependencies || []).some(
      (depId) => !completedTaskIds.has(depId)
    );

    const isBlocked = hasUnmetDependencies && task.status !== "completed";

    // Overdue check: past due date and not completed
    const isOverdue =
      task.status !== "completed" && calculatedDueDate.localeCompare(today) < 0;

    // Priority escalation if due within 48 hours or overdue
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
 * Generates default canonical tasks tailored to event profile and venue
 */
export function generateDefaultTasks(eventDateStr: string, isOutdoor: boolean): Task[] {
  const baseTasks: Array<Omit<Task, "dueDate" | "isOverdue" | "isBlocked">> = [
    {
      id: "task-venue-lock",
      title: "Confirm & Book Venue Lawn / Hall",
      description: isOutdoor
        ? "Inspect Pune outdoor lawn, verify lighting, lawn permits, and rain cover contingency."
        : "Finalize indoor AC hall booking, verify seating capacity and sound limit timings.",
      category: "venue",
      priority: "urgent",
      relativeDays: -21,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 800000, // ₹8,000
    },
    {
      id: "task-guest-rsvp",
      title: "Send Digital Invites & Collect RSVPs",
      description: "Dispatch WhatsApp / digital animated invites to confirm 60 headcount.",
      category: "invitations",
      priority: "high",
      relativeDays: -18,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 50000, // ₹500
    },
    {
      id: "task-caterer-lock",
      title: "Lock Vegetarian Catering Menu & Tasting",
      description: "Finalize Pune caterer for 60 guests: starters, live chaat, main course, and beverages.",
      category: "food_beverage",
      priority: "high",
      relativeDays: -14,
      status: "todo",
      dependencies: ["task-venue-lock", "task-guest-rsvp"],
      estimatedCostMinor: 1800000, // ₹18,000
    },
    {
      id: "task-anime-cake",
      title: "Order Custom Anime Themed Birthday Cake",
      description: "Order 2kg fondant/cream cake featuring sister's favorite anime character with bakery in Pune.",
      category: "food_beverage",
      priority: "high",
      relativeDays: -10,
      status: "todo",
      dependencies: ["task-caterer-lock"],
      estimatedCostMinor: 250000, // ₹2,500
    },
    {
      id: "task-decor-plan",
      title: "Finalize Anime Decor, Photo Backdrop & Standees",
      description: "Approve stage layout, character standees, fairy lights, and balloon garland design.",
      category: "decorations",
      priority: "medium",
      relativeDays: -7,
      status: "todo",
      dependencies: ["task-venue-lock"],
      estimatedCostMinor: 500000, // ₹5,000
    },
    {
      id: "task-photo-vendor",
      title: "Book Freelance Photographer (3 Hours)",
      description: "Confirm photographer for candid portraits, cake cutting, and group pictures.",
      category: "photography",
      priority: "medium",
      relativeDays: -7,
      status: "todo",
      dependencies: ["task-venue-lock"],
      estimatedCostMinor: 350000, // ₹3,500
    },
    {
      id: "task-sound-music",
      title: "Setup Sound System & Curate Anime Playlist",
      description: "Arrange portable Bluetooth PA speaker and curate Japanese anime OSTs + party tracks.",
      category: "entertainment",
      priority: "medium",
      relativeDays: -4,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 150000, // ₹1,500
    },
    {
      id: "task-weather-check",
      title: isOutdoor ? "Check Pune Evening Weather Forecast & Rain Plan" : "Verify AC & Power Backup",
      description: isOutdoor
        ? "Inspect Pune IMD radar for evening rain/wind. Verify gazebo/waterproof canopy readiness."
        : "Check generator backup for lighting and sound system.",
      category: "general",
      priority: "high",
      relativeDays: -2,
      status: "todo",
      dependencies: ["task-venue-lock"],
    },
    {
      id: "task-day-setup",
      title: "Venue Handover & On-site Decoration Setup",
      description: "Arrive 3 hours early at venue to supervise balloon setup, cake table, and sound check.",
      category: "coordination",
      priority: "urgent",
      relativeDays: 0,
      status: "todo",
      dependencies: ["task-decor-plan", "task-venue-lock"],
    },
  ];

  const { updatedTasks } = recalculateSchedule(
    baseTasks.map((t) => ({
      ...t,
      dueDate: addDaysToDate(eventDateStr, t.relativeDays),
      isBlocked: false,
      isOverdue: false,
    })),
    eventDateStr
  );

  return updatedTasks;
}
