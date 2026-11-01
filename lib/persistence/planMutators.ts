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

export function deleteBudgetItemFromPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    budgetItems: prev.budgetItems.filter((item) => item.id !== id),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

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

export function deleteVendorFromPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    vendors: prev.vendors.filter((v) => v.id !== id),
    updatedAt: new Date().toISOString(),
    version: prev.version + 1,
  };
}

export function toggleSaveIdeaInPlan(prev: EventPlan, id: string): EventPlan {
  return {
    ...prev,
    ideas: prev.ideas.map((idea) => (idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea)),
  };
}
