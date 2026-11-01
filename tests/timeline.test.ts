import { describe, it, expect } from "vitest";
import {
  detectCircularDependencies,
  sortTasksByExecutionOrder,
  recalculateSchedule,
  addDaysToDate,
  formatISODate,
} from "../lib/timeline/timelineEngine";
import { Task } from "../lib/types/event";

describe("Timeline & Dependency Engine", () => {
  const baseTasks: Task[] = [
    {
      id: "t-venue",
      title: "Book Venue",
      description: "Secure hall",
      category: "venue",
      priority: "urgent",
      relativeDays: -20,
      dueDate: "2026-11-01",
      status: "todo",
      dependencies: [],
      isOverdue: false,
      isBlocked: false,
    },
    {
      id: "t-decor",
      title: "Finalize Decor",
      description: "Stage layout",
      category: "decorations",
      priority: "medium",
      relativeDays: -10,
      dueDate: "2026-11-11",
      status: "todo",
      dependencies: ["t-venue"],
      isOverdue: false,
      isBlocked: false,
    },
    {
      id: "t-setup",
      title: "On-site Setup",
      description: "Arrival and setup",
      category: "coordination",
      priority: "urgent",
      relativeDays: 0,
      dueDate: "2026-11-21",
      status: "todo",
      dependencies: ["t-decor", "t-venue"],
      isOverdue: false,
      isBlocked: false,
    },
  ];

  it("orders tasks topologically respecting dependencies", () => {
    // Reverse the input order
    const reversed = [...baseTasks].reverse();
    const sorted = sortTasksByExecutionOrder(reversed);

    const venueIdx = sorted.findIndex((t) => t.id === "t-venue");
    const decorIdx = sorted.findIndex((t) => t.id === "t-decor");
    const setupIdx = sorted.findIndex((t) => t.id === "t-setup");

    expect(venueIdx).toBeLessThan(decorIdx);
    expect(decorIdx).toBeLessThan(setupIdx);
  });

  it("detects circular dependencies correctly", () => {
    const cyclicTasks: Task[] = [
      {
        id: "task-A",
        title: "Task A",
        description: "",
        category: "general",
        priority: "medium",
        relativeDays: -5,
        dueDate: "2026-11-15",
        status: "todo",
        dependencies: ["task-B"],
        isOverdue: false,
        isBlocked: false,
      },
      {
        id: "task-B",
        title: "Task B",
        description: "",
        category: "general",
        priority: "medium",
        relativeDays: -3,
        dueDate: "2026-11-17",
        status: "todo",
        dependencies: ["task-A"], // Circular loop A -> B -> A
        isOverdue: false,
        isBlocked: false,
      },
    ];

    const result = detectCircularDependencies(cyclicTasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycleTaskIds.length).toBeGreaterThan(0);
  });

  it("marks dependent tasks as blocked when prerequisites are incomplete", () => {
    const { updatedTasks } = recalculateSchedule(baseTasks, "2026-11-21", "2026-10-25");

    const decorTask = updatedTasks.find((t) => t.id === "t-decor");
    const setupTask = updatedTasks.find((t) => t.id === "t-setup");
    const venueTask = updatedTasks.find((t) => t.id === "t-venue");

    expect(venueTask?.isBlocked).toBe(false);
    expect(decorTask?.isBlocked).toBe(true);
    expect(setupTask?.isBlocked).toBe(true);
  });

  it("unblocks dependent tasks once prerequisite task is marked completed", () => {
    const venueCompleted = baseTasks.map((t) =>
      t.id === "t-venue" ? { ...t, status: "completed" as const } : t
    );

    const { updatedTasks } = recalculateSchedule(venueCompleted, "2026-11-21", "2026-10-25");

    const decorTask = updatedTasks.find((t) => t.id === "t-decor");
    expect(decorTask?.isBlocked).toBe(false);
  });

  it("identifies overdue tasks accurately when past due date", () => {
    // Current date is 2026-11-15
    const { updatedTasks } = recalculateSchedule(baseTasks, "2026-11-21", "2026-11-15");

    // t-venue was due 2026-11-01 (relative -20d from 2026-11-21)
    const venueTask = updatedTasks.find((t) => t.id === "t-venue");
    expect(venueTask?.isOverdue).toBe(true);
    expect(venueTask?.priority).toBe("urgent");

    // t-setup is due 2026-11-21, so not overdue on 2026-11-15
    const setupTask = updatedTasks.find((t) => t.id === "t-setup");
    expect(setupTask?.isOverdue).toBe(false);
  });

  it("recalculates all deadlines when event date is postponed or shifted", () => {
    const initialDate = "2026-11-20";
    const shiftedDate = "2026-12-05"; // postponed by 15 days

    const { updatedTasks } = recalculateSchedule(baseTasks, shiftedDate, "2026-10-25");

    const venue = updatedTasks.find((t) => t.id === "t-venue");
    // relativeDays: -20 from 2026-12-05 = 2026-11-15
    expect(venue?.dueDate).toBe("2026-11-15");

    const setup = updatedTasks.find((t) => t.id === "t-setup");
    // relativeDays: 0 from 2026-12-05 = 2026-12-05
    expect(setup?.dueDate).toBe("2026-12-05");
  });

  it("handles last-minute events (< 7 days away) without generating past impossible dates", () => {
    const today = "2026-10-22";
    const emergencyEventDate = "2026-10-25"; // only 3 days away!

    const { updatedTasks, warnings } = recalculateSchedule(baseTasks, emergencyEventDate, today);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("Event is only 3 day(s) away");

    // None of the incomplete tasks should have due dates before today
    for (const task of updatedTasks) {
      expect(task.dueDate >= today).toBe(true);
    }
  });
});
