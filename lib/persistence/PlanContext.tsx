"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from "react";
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
import { createEmptyEventPlan, createReferenceEventPlan, createCustomEventPlan } from "./defaultEvent";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { recalculateSchedule } from "../timeline/timelineEngine";

export interface PlanContextType {
  plan: EventPlan;
  plans: EventPlan[];
  activePlanId: string;
  isHydrated: boolean;
  activeProposal: ReplanningProposal | null;
  lastAppliedProposalId: string | null;

  // Multi-event operations
  switchEvent: (id: string) => void;
  createEvent: (
    name?: string,
    type?: "birthday" | "wedding" | "community" | "corporate" | "anniversary" | "other",
    overrides?: Partial<EventProfile>
  ) => string;
  duplicateEvent: (id: string) => string;
  deleteEvent: (id: string) => void;
  updateEventName: (id: string, name: string) => void;

  // Active plan mutators
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
  setFullPlan: (newPlan: EventPlan, createAsNew?: boolean) => void;
}

const STORAGE_EVENTS_KEY = "eventpilot_events_v2";
const STORAGE_ACTIVE_ID_KEY = "eventpilot_active_event_id";
const LEGACY_STORAGE_KEY = "eventpilot_active_plan_v2";

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<EventPlan[]>([createReferenceEventPlan()]);
  const [activePlanId, setActivePlanId] = useState<string>("ep-aanya-18th-anime");
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [activeProposal, setActiveProposal] = useState<ReplanningProposal | null>(null);
  const [lastAppliedProposalId, setLastAppliedProposalId] = useState<string | null>(null);

  // Derive current active plan
  const plan = useMemo(() => {
    const found = plans.find((p) => p.profile.id === activePlanId);
    return found || plans[0] || createReferenceEventPlan();
  }, [plans, activePlanId]);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(STORAGE_EVENTS_KEY);
      const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);

      let loadedPlans: EventPlan[] = [];

      if (storedEvents) {
        try {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              const validated = EventPlanSchema.safeParse(item);
              if (validated.success) {
                loadedPlans.push(validated.data as EventPlan);
              }
            }
          }
        } catch (e) {
          console.warn("Failed to parse stored events collection:", e);
        }
      }

      // Fallback to legacy single plan if no multi-event store exists
      if (loadedPlans.length === 0) {
        const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyStored) {
          try {
            const parsed = JSON.parse(legacyStored);
            const validated = EventPlanSchema.safeParse(parsed);
            if (validated.success) {
              loadedPlans.push(validated.data as EventPlan);
            }
          } catch (e) {
            console.warn("Failed to parse legacy stored plan:", e);
          }
        }
      }

      // If still empty, initialize with rich reference plan
      if (loadedPlans.length === 0) {
        loadedPlans = [createReferenceEventPlan()];
      }

      setPlans(loadedPlans);

      // Determine active event ID
      if (storedActiveId && loadedPlans.some((p) => p.profile.id === storedActiveId)) {
        setActivePlanId(storedActiveId);
      } else {
        setActivePlanId(loadedPlans[0].profile.id);
      }
    } catch (e) {
      console.error("Failed to load plans from localStorage, using fallback:", e);
      const defaultPlan = createReferenceEventPlan();
      setPlans([defaultPlan]);
      setActivePlanId(defaultPlan.profile.id);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage on state changes
  useEffect(() => {
    if (isHydrated && plans.length > 0) {
      try {
        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(plans));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activePlanId);
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(plan));
      } catch (e) {
        console.error("Failed to persist events to localStorage:", e);
      }
    }
  }, [plans, activePlanId, plan, isHydrated]);

  const plansRef = useRef(plans);
  plansRef.current = plans;

  // Helper to mutate the currently active plan
  const updateActivePlan = useCallback((updater: (prev: EventPlan) => EventPlan) => {
    setPlans((prevPlans) => {
      const targetIndex = prevPlans.findIndex((p) => p.profile.id === activePlanId);
      if (targetIndex >= 0) {
        const next = [...prevPlans];
        next[targetIndex] = updater(prevPlans[targetIndex]);
        return next;
      }
      return prevPlans;
    });
  }, [activePlanId]);

  // Multi-event handlers
  const switchEvent = useCallback((id: string) => {
    const exists = plansRef.current.some((p) => p.profile.id === id);
    if (exists) {
      setActivePlanId(id);
      setActiveProposal(null);
      setLastAppliedProposalId(null);
    }
  }, []);

  const createEvent = useCallback((
    name = "New Celebration",
    type: "birthday" | "wedding" | "community" | "corporate" | "anniversary" | "other" = "other",
    overrides: Partial<EventProfile> = {}
  ): string => {
    const newPlan = createCustomEventPlan(name, type, overrides);
    setPlans((prev) => [...prev, newPlan]);
    setActivePlanId(newPlan.profile.id);
    setActiveProposal(null);
    setLastAppliedProposalId(null);
    return newPlan.profile.id;
  }, []);

  const duplicateEvent = useCallback((id: string): string => {
    const currentPlans = plansRef.current;
    const source = currentPlans.find((p) => p.profile.id === id) || currentPlans[0] || createReferenceEventPlan();
    const newId = "ep-" + Math.random().toString(36).substring(2, 9);
    const clone: EventPlan = {
      ...JSON.parse(JSON.stringify(source)),
      profile: {
        ...source.profile,
        id: newId,
        name: `${source.profile.name} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    setPlans((prev) => [...prev, clone]);
    setActivePlanId(newId);
    setActiveProposal(null);
    setLastAppliedProposalId(null);
    return newId;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    const currentPlans = plansRef.current;
    const remaining = currentPlans.filter((p) => p.profile.id !== id);
    if (remaining.length === 0) {
      const fresh = createCustomEventPlan("My New Event", "other");
      setPlans([fresh]);
      setActivePlanId(fresh.profile.id);
    } else {
      setPlans(remaining);
      if (activePlanId === id) {
        setActivePlanId(remaining[0].profile.id);
      }
    }
    setActiveProposal(null);
    setLastAppliedProposalId(null);
  }, [activePlanId]);

  const updateEventName = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.profile.id === id
          ? {
              ...p,
              profile: { ...p.profile, name: trimmed },
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  // Active plan mutators
  const updateProfile = useCallback((profileUpdates: Partial<EventProfile>) => {
    updateActivePlan((prev) => {
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
    });
  }, [updateActivePlan]);

  const addBudgetItem = useCallback((item: Omit<BudgetItem, "id">) => {
    const newItem: BudgetItem = {
      ...item,
      id: "bi-" + Math.random().toString(36).substring(2, 9),
    };
    updateActivePlan((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, newItem],
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    updateActivePlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const deleteBudgetItem = useCallback((id: string) => {
    updateActivePlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: "t-" + Math.random().toString(36).substring(2, 9),
    };
    updateActivePlan((prev) => {
      const newTasks = [...prev.tasks, newTask];
      const { updatedTasks } = recalculateSchedule(newTasks, prev.profile.date);
      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  }, [updateActivePlan]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateActivePlan((prev) => {
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
  }, [updateActivePlan]);

  const deleteTask = useCallback((id: string) => {
    updateActivePlan((prev) => {
      const filtered = prev.tasks.filter((t) => t.id !== id);
      const { updatedTasks } = recalculateSchedule(filtered, prev.profile.date);
      return {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        version: prev.version + 1,
      };
    });
  }, [updateActivePlan]);

  const toggleTaskStatus = useCallback((id: string) => {
    updateActivePlan((prev) => {
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
  }, [updateActivePlan]);

  const addVendor = useCallback((vendor: Omit<VendorRecord, "id">) => {
    const newVendor: VendorRecord = {
      ...vendor,
      id: "v-" + Math.random().toString(36).substring(2, 9),
    };
    updateActivePlan((prev) => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const updateVendor = useCallback((id: string, updates: Partial<VendorRecord>) => {
    updateActivePlan((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const deleteVendor = useCallback((id: string) => {
    updateActivePlan((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
      updatedAt: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, [updateActivePlan]);

  const toggleSaveIdea = useCallback((id: string) => {
    updateActivePlan((prev) => ({
      ...prev,
      ideas: prev.ideas.map((idea) =>
        idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea
      ),
    }));
  }, [updateActivePlan]);

  const applyProposal = useCallback((proposal: ReplanningProposal) => {
    const validated = EventPlanSchema.safeParse(proposal.revisedPlan);
    if (!validated.success) {
      throw new Error("This proposal could not be applied because its revised plan is invalid.");
    }

    updateActivePlan((currentPlan) => ({
      ...(validated.data as EventPlan),
      updatedAt: new Date().toISOString(),
      version: Math.max(currentPlan.version + 1, proposal.revisedPlan.version + 1),
    }));
    setLastAppliedProposalId(proposal.id);
    setActiveProposal(null);
  }, [updateActivePlan]);

  const rejectProposal = useCallback(() => {
    setActiveProposal(null);
  }, []);

  const setFullPlan = useCallback((newPlan: EventPlan, createAsNew = false) => {
    if (createAsNew) {
      const freshId = "ep-" + Math.random().toString(36).substring(2, 9);
      const freshPlan: EventPlan = {
        ...newPlan,
        profile: {
          ...newPlan.profile,
          id: freshId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlans((prev) => [...prev, freshPlan]);
      setActivePlanId(freshId);
    } else {
      setPlans((prev) => {
        const exists = prev.some((p) => p.profile.id === newPlan.profile.id);
        if (exists) {
          return prev.map((p) => (p.profile.id === newPlan.profile.id ? newPlan : p));
        }
        return prev.map((p) => (p.profile.id === activePlanId ? newPlan : p));
      });
      setActivePlanId(newPlan.profile.id);
    }
    setLastAppliedProposalId(null);
    setActiveProposal(null);
  }, [activePlanId]);

  const contextValue = useMemo<PlanContextType>(
    () => ({
      plan,
      plans,
      activePlanId,
      isHydrated,
      activeProposal,
      lastAppliedProposalId,
      switchEvent,
      createEvent,
      duplicateEvent,
      deleteEvent,
      updateEventName,
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
      setFullPlan,
    }),
    [
      plan,
      plans,
      activePlanId,
      isHydrated,
      activeProposal,
      lastAppliedProposalId,
      switchEvent,
      createEvent,
      duplicateEvent,
      deleteEvent,
      updateEventName,
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
      applyProposal,
      rejectProposal,
      setFullPlan,
    ]
  );

  return (
    <PlanContext.Provider value={contextValue}>
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
