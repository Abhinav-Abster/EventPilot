/**
 * Custom React hook synchronizing in-memory event plans with browser local storage.
 */
import { useEffect, useRef, useCallback } from "react";
import { EventPlan } from "../types/event";
import { loadStoredPlans, saveStoredPlans } from "./storage";

/**
 * Options configuring synchronized browser storage for event plans.
 */
export interface UsePlanStorageOptions {
  plans: EventPlan[];
  activePlanId: string;
  setPlans: React.Dispatch<React.SetStateAction<EventPlan[]>>;
  setActivePlanId: React.Dispatch<React.SetStateAction<string>>;
  setIsHydrated: React.Dispatch<React.SetStateAction<boolean>>;
  isHydrated: boolean;
}

/**
 * React hook managing synchronized storage reads, writes, and initial plan hydration.
 */
export function usePlanStorage(options: UsePlanStorageOptions) {
  const { plans, activePlanId, setPlans, setActivePlanId, setIsHydrated, isHydrated } = options;
  useEffect(() => {
    const { loadedPlans, activeId } = loadStoredPlans();
    setPlans(loadedPlans);
    setActivePlanId(activeId);
    setIsHydrated(true);
  }, [setPlans, setActivePlanId, setIsHydrated]);

  const plansRef = useRef(plans);
  plansRef.current = plans;
  const activePlanIdRef = useRef(activePlanId);
  activePlanIdRef.current = activePlanId;
  const lastSavedPlansRef = useRef<EventPlan[] | null>(null);
  const lastSavedActiveIdRef = useRef<string | null>(null);

  const flushSave = useCallback(() => {
    if (!isHydrated || plansRef.current.length === 0) return;
    if (
      plansRef.current === lastSavedPlansRef.current &&
      activePlanIdRef.current === lastSavedActiveIdRef.current
    ) {
      return;
    }
    saveStoredPlans(plansRef.current, activePlanIdRef.current);
    lastSavedPlansRef.current = plansRef.current;
    lastSavedActiveIdRef.current = activePlanIdRef.current;
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || plans.length === 0) return;
    if (plans === lastSavedPlansRef.current && activePlanId === lastSavedActiveIdRef.current)
      return;

    const timer = setTimeout(() => {
      flushSave();
    }, 500);

    return () => clearTimeout(timer);
  }, [plans, activePlanId, isHydrated, flushSave]);

  useEffect(() => {
    const handleFlush = () => flushSave();
    window.addEventListener("pagehide", handleFlush);
    window.addEventListener("beforeunload", handleFlush);
    return () => {
      window.removeEventListener("pagehide", handleFlush);
      window.removeEventListener("beforeunload", handleFlush);
    };
  }, [flushSave]);

  return { plansRef, activePlanIdRef };
}
