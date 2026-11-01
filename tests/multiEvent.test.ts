import { describe, it, expect } from "vitest";
import { createCustomEventPlan, createReferenceEventPlan } from "../lib/persistence/defaultEvent";
import { EventPlanSchema } from "../lib/schemas/eventSchemas";
import { paiseToRupees, rupeesToPaise } from "../lib/budget/moneyUtils";
import { EventPlan } from "../lib/types/event";

describe("Multiple Event Management Engine", () => {
  it("initializes separate event plans with unique IDs and schemas", () => {
    const event1 = createReferenceEventPlan();
    const event2 = createCustomEventPlan("Pune Tech Conference", "corporate", {
      location: { city: "Pune", venueType: "indoor" },
      guestCount: 200,
      totalBudgetMinor: rupeesToPaise(150000),
    });

    expect(event1.profile.id).not.toBe(event2.profile.id);
    expect(event1.profile.name).toBe("Aanya's 18th Anime Birthday Bash");
    expect(event2.profile.name).toBe("Pune Tech Conference");
    expect(event2.profile.type).toBe("corporate");
    expect(paiseToRupees(event2.profile.totalBudgetMinor)).toBe(150000);

    expect(EventPlanSchema.safeParse(event1).success).toBe(true);
    expect(EventPlanSchema.safeParse(event2).success).toBe(true);
  });

  it("handles event duplication without mutating the original event", () => {
    const original = createReferenceEventPlan();
    const clonedId = "ep-" + Math.random().toString(36).substring(2, 9);
    const clone: EventPlan = {
      ...JSON.parse(JSON.stringify(original)),
      profile: {
        ...original.profile,
        id: clonedId,
        name: `${original.profile.name} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    expect(clone.profile.id).toBe(clonedId);
    expect(clone.profile.name).toBe("Aanya's 18th Anime Birthday Bash (Copy)");
    expect(clone.tasks.length).toBe(original.tasks.length);
    expect(clone.budgetItems.length).toBe(original.budgetItems.length);

    // Mutate copy
    clone.tasks[0].status = "completed";
    expect(original.tasks[0].status).not.toBe("completed");
  });

  it("handles event deletion and fallback to remaining event", () => {
    let plans: EventPlan[] = [
      createReferenceEventPlan(),
      createCustomEventPlan("Corporate Gala", "corporate"),
    ];
    let activeId = plans[0].profile.id;

    // Delete active event
    const idToDelete = activeId;
    plans = plans.filter((p) => p.profile.id !== idToDelete);
    if (activeId === idToDelete) {
      activeId = plans[0].profile.id;
    }

    expect(plans.length).toBe(1);
    expect(activeId).toBe(plans[0].profile.id);
    expect(plans[0].profile.name).toBe("Corporate Gala");

    // Deleting the last event re-initializes a clean fallback
    plans = plans.filter((p) => p.profile.id !== activeId);
    if (plans.length === 0) {
      const fresh = createCustomEventPlan("My New Event", "other");
      plans = [fresh];
      activeId = fresh.profile.id;
    }

    expect(plans.length).toBe(1);
    expect(plans[0].profile.name).toBe("My New Event");
  });

  it("renames an event correctly without affecting other properties", () => {
    const event = createReferenceEventPlan();
    const updated = {
      ...event,
      profile: {
        ...event.profile,
        name: "Aanya's 18th Grand Studio Ghibli Celebration",
      },
    };

    expect(updated.profile.name).toBe("Aanya's 18th Grand Studio Ghibli Celebration");
    expect(updated.profile.type).toBe(event.profile.type);
    expect(updated.budgetItems.length).toBe(event.budgetItems.length);
  });
});
