"use client";

/**
 * Global React context provider managing multi-event planning state, active selection, and replanning proposals.
 */
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import {
  EventPlan,
  BudgetItem,
  Task,
  VendorRecord,
  EventProfile,
  ReplanningProposal,
  EventType,
} from "../types/event";
import { createReferenceEventPlan, createCustomEventPlan } from "./defaultEvent";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { createId } from "../utils/id";
import {
  applyProfileUpdates,
  addBudgetItemToPlan,
  updateBudgetItemInPlan,
  deleteBudgetItemFromPlan,
  addTaskToPlan,
  updateTaskInPlan,
  deleteTaskFromPlan,
  toggleTaskStatusInPlan,
  addVendorToPlan,
  updateVendorInPlan,
  deleteVendorFromPlan,
  toggleSaveIdeaInPlan,
  duplicatePlan,
} from "./planMutators";
import { usePlanStorage } from "./usePlanStorage";
import { PlanContextType } from "./planContextTypes";
import { REFERENCE_PLAN_ID } from "../config/constants";

export type { PlanContextType };

const PlanContext = createContext<PlanContextType | undefined>(undefined);

/**
 * React context provider establishing global event planning state, persistence, and dispatch handlers.
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<EventPlan[]>([createReferenceEventPlan()]);
  const [activePlanId, setActivePlanId] = useState<string>(REFERENCE_PLAN_ID);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [activeProposal, setActiveProposal] = useState<ReplanningProposal | null>(null);
  const [lastAppliedProposalId, setLastAppliedProposalId] = useState<string | null>(null);

  const plan = useMemo(() => {
    const found = plans.find((p) => p.profile.id === activePlanId);
    return found || plans[0] || createReferenceEventPlan();
  }, [plans, activePlanId]);

  const { plansRef } = usePlanStorage(
    plans,
    activePlanId,
    setPlans,
    setActivePlanId,
    setIsHydrated,
    isHydrated
  );

  const updateActivePlan = useCallback(
    (updater: (prev: EventPlan) => EventPlan) => {
      setPlans((prevPlans) => {
        const targetIndex = prevPlans.findIndex((p) => p.profile.id === activePlanId);
        if (targetIndex >= 0) {
          const next = [...prevPlans];
          next[targetIndex] = updater(prevPlans[targetIndex]);
          return next;
        }
        return prevPlans;
      });
    },
    [activePlanId]
  );

  const switchEvent = useCallback(
    (id: string) => {
      if (plansRef.current.some((p) => p.profile.id === id)) {
        setActivePlanId(id);
        setActiveProposal(null);
        setLastAppliedProposalId(null);
      }
    },
    [plansRef]
  );

  const createEvent = useCallback(
    (
      name = "New Celebration",
      type: EventType = "other",
      overrides: Partial<EventProfile> = {}
    ): string => {
      const newPlan = createCustomEventPlan(name, type, overrides);
      setPlans((prev) => [...prev, newPlan]);
      setActivePlanId(newPlan.profile.id);
      setActiveProposal(null);
      setLastAppliedProposalId(null);
      return newPlan.profile.id;
    },
    []
  );

  const duplicateEvent = useCallback(
    (id: string): string => {
      const currentPlans = plansRef.current;
      const source =
        currentPlans.find((p) => p.profile.id === id) ||
        currentPlans[0] ||
        createReferenceEventPlan();
      const clone = duplicatePlan(source);
      setPlans((prev) => [...prev, clone]);
      setActivePlanId(clone.profile.id);
      setActiveProposal(null);
      setLastAppliedProposalId(null);
      return clone.profile.id;
    },
    [plansRef]
  );

  const deleteEvent = useCallback(
    (id: string) => {
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
    },
    [activePlanId, plansRef]
  );

  const updateEventName = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.profile.id === id
          ? { ...p, profile: { ...p.profile, name: trimmed }, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const updateProfile = useCallback(
    (profileUpdates: Partial<EventProfile>) => {
      updateActivePlan((prev) => applyProfileUpdates(prev, profileUpdates));
    },
    [updateActivePlan]
  );

  const addBudgetItem = useCallback(
    (item: Omit<BudgetItem, "id">) => {
      updateActivePlan((prev) => addBudgetItemToPlan(prev, item));
    },
    [updateActivePlan]
  );

  const updateBudgetItem = useCallback(
    (id: string, updates: Partial<BudgetItem>) => {
      updateActivePlan((prev) => updateBudgetItemInPlan(prev, id, updates));
    },
    [updateActivePlan]
  );

  const deleteBudgetItem = useCallback(
    (id: string) => {
      updateActivePlan((prev) => deleteBudgetItemFromPlan(prev, id));
    },
    [updateActivePlan]
  );

  const addTask = useCallback(
    (task: Omit<Task, "id">) => {
      updateActivePlan((prev) => addTaskToPlan(prev, task));
    },
    [updateActivePlan]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateActivePlan((prev) => updateTaskInPlan(prev, id, updates));
    },
    [updateActivePlan]
  );

  const deleteTask = useCallback(
    (id: string) => {
      updateActivePlan((prev) => deleteTaskFromPlan(prev, id));
    },
    [updateActivePlan]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      updateActivePlan((prev) => toggleTaskStatusInPlan(prev, id));
    },
    [updateActivePlan]
  );

  const addVendor = useCallback(
    (vendor: Omit<VendorRecord, "id">) => {
      updateActivePlan((prev) => addVendorToPlan(prev, vendor));
    },
    [updateActivePlan]
  );

  const updateVendor = useCallback(
    (id: string, updates: Partial<VendorRecord>) => {
      updateActivePlan((prev) => updateVendorInPlan(prev, id, updates));
    },
    [updateActivePlan]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      updateActivePlan((prev) => deleteVendorFromPlan(prev, id));
    },
    [updateActivePlan]
  );

  const toggleSaveIdea = useCallback(
    (id: string) => {
      updateActivePlan((prev) => toggleSaveIdeaInPlan(prev, id));
    },
    [updateActivePlan]
  );

  const applyProposal = useCallback(
    (proposal: ReplanningProposal) => {
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
    },
    [updateActivePlan]
  );

  const rejectProposal = useCallback(() => {
    setActiveProposal(null);
  }, []);

  const setFullPlan = useCallback(
    (newPlan: EventPlan, createAsNew = false) => {
      if (createAsNew) {
        const freshId = createId("ep");
        const freshPlan: EventPlan = {
          ...newPlan,
          profile: { ...newPlan.profile, id: freshId },
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
    },
    [activePlanId]
  );

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

  return <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>;
}

/**
 * Hook accessing active event planning state, mutators, and replanning actions from PlanContext.
 */
export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}
