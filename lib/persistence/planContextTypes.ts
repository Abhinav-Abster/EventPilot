/**
 * Type definitions for the PlanContext state store and available state dispatchers.
 */
import {
  EventPlan,
  BudgetItem,
  Task,
  VendorRecord,
  EventProfile,
  ReplanningProposal,
  EventType,
} from "../types/event";

/**
 * Interface representing the complete application event plan context state and mutation methods.
 */
export interface PlanContextType {
  plan: EventPlan;
  plans: EventPlan[];
  activePlanId: string;
  isHydrated: boolean;
  activeProposal: ReplanningProposal | null;
  lastAppliedProposalId: string | null;

  // Multi-event operations
  switchEvent: (id: string) => void;
  createEvent: (name?: string, type?: EventType, overrides?: Partial<EventProfile>) => string;
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
