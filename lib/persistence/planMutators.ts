/**
 * Pure state transformation functions updating event entities immutably.
 */
import {
  EventPlan,
  BudgetItem,
  Task,
  TaskStatus,
  VendorRecord,
  EventProfile,
} from "../types/event";
import { recalculateSchedule } from "../timeline/timelineEngine";
import { createId } from "../utils/id";

/**
 * Deep clones an existing plan with a new unique ID and updated timestamp.
 */
export function duplicatePlan(source: EventPlan): EventPlan {
  const newId = createId("ep");
  return {
    ...structuredClone(source),
    profile: {
      ...source.profile,
      id: newId,
      name: `${source.profile.name} (Copy)`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Immutably updates event profile metadata and touches updatedAt timestamp.
 */
export function applyProfileUpdates(
  prev: EventPlan,
  profileUpdates: Partial<EventProfile>
): EventPlan {
  const newProfile: EventProfile = { ...prev.profile, ...profileUpdates };
  let updatedTasks = prev.tasks;

  if (profileUpdates.date && profileUpdates.date !== prev.profile.date) {
    const res = recalculateSchedule(prev.tasks, profileUpdates.date);
    updatedTasks = res.updatedTasks;
  }

  return {
    ...prev,
    profile: newProfile,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Inserts a new budget item into the plan immutably.
 */
export function addBudgetItemToPlan(prev: EventPlan, item: Omit<BudgetItem, "id">): EventPlan {
  const newItem: BudgetItem = {
    ...item,
    id: createId("bi"),
  };
  return {
    ...prev,
    budgetItems: [...prev.budgetItems, newItem],
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Modifies an existing budget item by ID within the plan.
 */
export function updateBudgetItemInPlan(
  prev: EventPlan,
  id: string,
  updates: Partial<BudgetItem>
): EventPlan {
  return {
    ...prev,
    budgetItems: prev.budgetItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Removes a budget item by ID from the plan.
 */
export function deleteBudgetItemFromPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    budgetItems: prev.budgetItems.filter((item) => item.id !== id),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Inserts a new milestone task into the plan immutably.
 */
export function addTaskToPlan(prev: EventPlan, task: Omit<Task, "id">): EventPlan {
  const newTask: Task = {
    ...task,
    id: createId("t"),
  };
  const newTasks = [...prev.tasks, newTask];
  const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);
  return {
    ...prev,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Modifies an existing task by ID within the plan.
 */
export function updateTaskInPlan(prev: EventPlan, id: string, updates: Partial<Task>): EventPlan {
  const newTasks = prev.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
  const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);
  return {
    ...prev,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Removes a task by ID from the plan.
 */
export function deleteTaskFromPlan(prev: EventPlan, id: string): EventPlan {
  const filtered = prev.tasks.filter((t) => t.id !== id);
  const { updatedTasks } = recalculateSchedule(filtered, prev.profile.date);
  return {
    ...prev,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Toggles a task status between todo, in_progress, and completed.
 */
export function toggleTaskStatusInPlan(prev: EventPlan, id: string): EventPlan {
  const target = prev.tasks.find((t) => t.id === id);
  if (!target) return prev;

  const newStatus: TaskStatus = target.status === "completed" ? "todo" : "completed";
  const newTasks = prev.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
  const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);

  return {
    ...prev,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Inserts a new vendor record into the plan immutably.
 */
export function addVendorToPlan(prev: EventPlan, vendor: Omit<VendorRecord, "id">): EventPlan {
  const newVendor: VendorRecord = {
    ...vendor,
    id: createId("v"),
  };
  return {
    ...prev,
    vendors: [...prev.vendors, newVendor],
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Modifies an existing vendor record by ID within the plan.
 */
export function updateVendorInPlan(
  prev: EventPlan,
  id: string,
  updates: Partial<VendorRecord>
): EventPlan {
  return {
    ...prev,
    vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Removes a vendor record by ID from the plan.
 */
export function deleteVendorFromPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    vendors: prev.vendors.filter((v) => v.id !== id),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

/**
 * Toggles the saved bookmark status of a creative idea card.
 */
export function toggleSaveIdeaInPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    ideas: prev.ideas.map((idea) => (idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea)),
  };
}
