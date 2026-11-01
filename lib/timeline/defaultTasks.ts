/**
 * Default milestone templates and task graphs tailored for indoor and outdoor event profiles.
 */
import { Task } from "../types/event";
import { addDaysToDate } from "./dateUtils";

/**
 * Builds the standard milestone task templates for an event given date and outdoor settings.
 */
export function getBaseEventTasks(
  isOutdoor: boolean
): Array<Omit<Task, "dueDate" | "isOverdue" | "isBlocked">> {
  return [
    {
      id: "task-venue-lock",
      title: "Confirm & Book Venue Lawn / Hall",
      description: isOutdoor
        ? "Inspect Pune outdoor lawn, verify lighting, lawn permits, and rain cover contingency."
        : "Finalize indoor AC hall booking, verify seating capacity and sound limit timings.",
      category: "venue",
      priority: "urgent",
      relativeDays: -21,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 800000, // ₹8,000
    },
    {
      id: "task-guest-rsvp",
      title: "Send Digital Invites & Collect RSVPs",
      description: "Dispatch WhatsApp / digital animated invites to confirm 60 headcount.",
      category: "invitations",
      priority: "high",
      relativeDays: -18,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 50000, // ₹500
    },
    {
      id: "task-caterer-lock",
      title: "Lock Vegetarian Catering Menu & Tasting",
      description:
        "Finalize Pune caterer for 60 guests: starters, live chaat, main course, and beverages.",
      category: "food_beverage",
      priority: "high",
      relativeDays: -14,
      status: "todo",
      dependencies: ["task-venue-lock", "task-guest-rsvp"],
      estimatedCostMinor: 1800000, // ₹18,000
    },
    {
      id: "task-anime-cake",
      title: "Order Custom Anime Themed Birthday Cake",
      description:
        "Order 2kg fondant/cream cake featuring sister's favorite anime character with bakery in Pune.",
      category: "food_beverage",
      priority: "high",
      relativeDays: -10,
      status: "todo",
      dependencies: ["task-caterer-lock"],
      estimatedCostMinor: 250000, // ₹2,500
    },
    {
      id: "task-decor-plan",
      title: "Finalize Anime Decor, Photo Backdrop & Standees",
      description:
        "Approve stage layout, character standees, fairy lights, and balloon garland design.",
      category: "decorations",
      priority: "medium",
      relativeDays: -7,
      status: "todo",
      dependencies: ["task-venue-lock"],
      estimatedCostMinor: 500000, // ₹5,000
    },
    {
      id: "task-photo-vendor",
      title: "Book Freelance Photographer (3 Hours)",
      description: "Confirm photographer for candid portraits, cake cutting, and group pictures.",
      category: "photography",
      priority: "medium",
      relativeDays: -7,
      status: "todo",
      dependencies: ["task-venue-lock"],
      estimatedCostMinor: 350000, // ₹3,500
    },
    {
      id: "task-sound-music",
      title: "Setup Sound System & Curate Anime Playlist",
      description:
        "Arrange portable Bluetooth PA speaker and curate Japanese anime OSTs + party tracks.",
      category: "entertainment",
      priority: "medium",
      relativeDays: -4,
      status: "todo",
      dependencies: [],
      estimatedCostMinor: 150000, // ₹1,500
    },
    {
      id: "task-weather-check",
      title: isOutdoor
        ? "Check Pune Evening Weather Forecast & Rain Plan"
        : "Verify AC & Power Backup",
      description: isOutdoor
        ? "Inspect Pune IMD radar for evening rain/wind. Verify gazebo/waterproof canopy readiness."
        : "Check generator backup for lighting and sound system.",
      category: "general",
      priority: "high",
      relativeDays: -2,
      status: "todo",
      dependencies: ["task-venue-lock"],
    },
    {
      id: "task-day-setup",
      title: "Venue Handover & On-site Decoration Setup",
      description:
        "Arrive 3 hours early at venue to supervise balloon setup, cake table, and sound check.",
      category: "coordination",
      priority: "urgent",
      relativeDays: 0,
      status: "todo",
      dependencies: ["task-decor-plan", "task-venue-lock"],
    },
  ];
}

/**
 * Instantiates and schedules default tasks using a recalculateSchedule delegate.
 */
export function buildDefaultTasks(
  eventDateStr: string,
  isOutdoor: boolean,
  recalculateFn: (tasks: Task[], eventDate: string) => { updatedTasks: Task[] }
): Task[] {
  const baseTasks = getBaseEventTasks(isOutdoor);
  const { updatedTasks } = recalculateFn(
    baseTasks.map((t) => ({
      ...t,
      dueDate: addDaysToDate(eventDateStr, t.relativeDays),
      isBlocked: false,
      isOverdue: false,
    })),
    eventDateStr
  );
  return updatedTasks;
}
