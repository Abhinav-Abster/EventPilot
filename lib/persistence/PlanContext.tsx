"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  EventPlan,
  BudgetItem,
  Task,
  TaskStatus,
  VendorRecord,
  CreativeIdea,
  EventProfile,
  ReplanningProposal,
} from "../types/event";
import { createCanonicalEventPlan } from "./defaultEvent";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { calculateBudgetSummary } from "../budget/budgetEngine";
import { recalculateSchedule } from "../timeline/timelineEngine";

interface PlanContextType {
  plan: EventPlan;
  isHydrated: boolean;
  demoMode: boolean;
  activeProposal: ReplanningProposal | null;
  setDemoMode: (val: boolean) => void;
  updateProfile: (profile: Partial<EventProfile>) => void;
  addBudgetItem: (item: Omit<BudgetItem, "id">) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  addVendor: (vendor: Omit<VendorRecord, "id">) => void;
  updateVendor: (id: string, updates: Partial<VendorRecord>) => void;
  deleteVendor: (id: string) => void;
  toggleSaveIdea: (id: string) => void;
  setActiveProposal: (prop: ReplanningProposal | null) => void;
  applyProposal: (prop: ReplanningProposal) => void;
  rejectProposal: () => void;
  resetToDemo: () => void;
  setFullPlan: (newPlan: EventPlan) => void;
}

const STORAGE_KEY = "eventpilot_active_plan_v1";

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<EventPlan>(createCanonicalEventPlan());
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [activeProposal, setActiveProposal] = useState<ReplanningProposal | null>(null);

  // Hydrate from localStorage safely on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = EventPlanSchema.safeParse(parsed);
        if (validated.success) {
          setPlan(validated.data as EventPlan);
        } else {
          console.warn("Stored plan failed validation, restoring default:", validated.error);
          const canonical = createCanonicalEventPlan();
          setPlan(canonical);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
        }
      } else {
        const canonical = createCanonicalEventPlan();
        setPlan(canonical);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
      }
    } catch (e) {
      console.error("Failed to load plan from localStorage, using fallback:", e);
      setPlan(createCanonicalEventPlan());
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage on state changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      } catch (e) {
        console.error("Failed to persist plan to localStorage:", e);
      }
    }
  }, [plan, isHydrated]);

  const updateProfile = (profileUpdates: Partial<EventProfile>) => {
    setPlan((prev) => {
      const newProfile: EventProfile = { ...prev.profile, ...profileUpdates };
      let updatedTasks = prev.tasks;

      // If date changed, recalculate all task schedules
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
    });
  };

  const addBudgetItem = (item: Omit<BudgetItem, "id">) => {
    const newItem: BudgetItem = {
      ...item,
      id: "bi-" + Math.random().toString(36).substring(2, 9),
    };
    setPlan((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, newItem],
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const deleteBudgetItem = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: "t-" + Math.random().toString(36).substring(2, 9),
    };
    setPlan((prev) => {
      const newTasks = [...prev.tasks, newTask];
      const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);
      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setPlan((prev) => {
      const newTasks = prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);
      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  };

  const deleteTask = (id: string) => {
    setPlan((prev) => {
      const filtered = prev.tasks.filter((t) => t.id !== id);
      const { updatedTasks } = recalculateSchedule(filtered, prev.profile.date);
      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  };

  const toggleTaskStatus = (id: string) => {
    setPlan((prev) => {
      const target = prev.tasks.find((t) => t.id === id);
      if (!target) return prev;

      const newStatus: TaskStatus = target.status === "completed" ? "todo" : "completed";
      const newTasks = prev.tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      );
      const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);

      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  };

  const addVendor = (vendor: Omit<VendorRecord, "id">) => {
    const newVendor: VendorRecord = {
      ...vendor,
      id: "v-" + Math.random().toString(36).substring(2, 9),
    };
    setPlan((prev) => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const updateVendor = (id: string, updates: Partial<VendorRecord>) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const deleteVendor = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  };

  const toggleSaveIdea = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      ideas: prev.ideas.map((idea) =>
        idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea
      ),
    }));
  };

  const applyProposal = (proposal: ReplanningProposal) => {
    setPlan({
      ...proposal.revisedPlan,
      updatedAt: new Date().toISOString(),
      version: proposal.revisedPlan.version + 1,
    });
    setActiveProposal(null);
  };

  const rejectProposal = () => {
    setActiveProposal(null);
  };

  const resetToDemo = () => {
    const canonical = createCanonicalEventPlan();
    setPlan(canonical);
    setActiveProposal(null);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
    }
  };

  const setFullPlan = (newPlan: EventPlan) => {
    setPlan(newPlan);
    setActiveProposal(null);
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        isHydrated,
        demoMode,
        activeProposal,
        setDemoMode,
        updateProfile,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addVendor,
        updateVendor,
        deleteVendor,
        toggleSaveIdea,
        setActiveProposal,
        applyProposal,
        rejectProposal,
        resetToDemo,
        setFullPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}
