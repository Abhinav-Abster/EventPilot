import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadStoredPlans,
  saveStoredPlans,
  STORAGE_EVENTS_KEY,
  STORAGE_ACTIVE_ID_KEY,
  LEGACY_STORAGE_KEY,
} from "../lib/persistence/storage";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";

describe("Storage persistence and migration", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    for (const key in mockLocalStorage) {
      delete mockLocalStorage[key];
    }

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
    });
  });

  it("returns reference plan as fallback when storage is empty", () => {
    const { loadedPlans, activeId } = loadStoredPlans();
    expect(loadedPlans.length).toBe(1);
    expect(loadedPlans[0].profile.name).toBe("Aanya's 18th Anime Birthday Bash");
    expect(activeId).toBe(loadedPlans[0].profile.id);
  });

  it("saves and loads multiple plans with active ID", () => {
    const plan = createReferenceEventPlan();
    saveStoredPlans([plan], plan.profile.id);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_EVENTS_KEY,
      JSON.stringify([plan])
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_ACTIVE_ID_KEY,
      plan.profile.id
    );

    const { loadedPlans, activeId } = loadStoredPlans();
    expect(loadedPlans.length).toBe(1);
    expect(loadedPlans[0].profile.id).toBe(plan.profile.id);
    expect(activeId).toBe(plan.profile.id);
  });

  it("migrates from legacy storage key and cleans it up", () => {
    const legacyPlan = createReferenceEventPlan();
    legacyPlan.profile.name = "Migrated Legacy Event";
    mockLocalStorage[LEGACY_STORAGE_KEY] = JSON.stringify(legacyPlan);

    const { loadedPlans, activeId } = loadStoredPlans();
    expect(loadedPlans.length).toBe(1);
    expect(loadedPlans[0].profile.name).toBe("Migrated Legacy Event");
    expect(activeId).toBe(legacyPlan.profile.id);

    // Verify legacy key was cleaned up
    expect(mockLocalStorage[LEGACY_STORAGE_KEY]).toBeUndefined();
  });

  it("gracefully falls back when stored JSON is corrupted", () => {
    mockLocalStorage[STORAGE_EVENTS_KEY] = "invalid json {";
    const { loadedPlans, activeId } = loadStoredPlans();
    expect(loadedPlans.length).toBe(1);
    expect(loadedPlans[0].profile.name).toBe("Aanya's 18th Anime Birthday Bash");
    expect(activeId).toBe(loadedPlans[0].profile.id);
  });
});
