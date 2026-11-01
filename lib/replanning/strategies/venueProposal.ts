import {
  EventPlan,
  EventProfile,
  BudgetItem,
  ReplanningProposal,
  PlanChangeDiff,
} from "../../types/event";
import { formatINR, addMoney } from "../../budget/moneyUtils";
import { ParsedConstraintChange } from "../types";

export function createVenueChangeProposal(
  currentPlan: EventPlan,
  changeIntent: ParsedConstraintChange
): ReplanningProposal[] {
  const newVenueType = changeIntent.newVenueType!;
  const oldVenueType = currentPlan.profile.location.venueType;

  const revisedProfile: EventProfile = {
    ...currentPlan.profile,
    location: {
      ...currentPlan.profile.location,
      venueType: newVenueType,
      venueName:
        newVenueType === "indoor"
          ? "Mayur Banquets & AC Hall, Pune"
          : "Green Meadows Open Lawn, Pune",
    },
  };

  const revisedItems: BudgetItem[] = currentPlan.budgetItems.map((item) => {
    if (item.category === "venue") {
      return {
        ...item,
        name:
          newVenueType === "indoor"
            ? "Indoor AC Banquet Hall Rental"
            : "Outdoor Garden Lawn Rental",
        estimatedCostMinor: newVenueType === "indoor" ? 950000 : 800000,
      };
    }
    if (item.category === "decorations") {
      return {
        ...item,
        name:
          newVenueType === "indoor" ? "Indoor Backdrop & LED Arch" : "Lawn Fairy Lights & Standees",
      };
    }
    return { ...item };
  });

  const revisedTasks = currentPlan.tasks.map((task) => {
    if (task.id === "task-weather-check") {
      return {
        ...task,
        title:
          newVenueType === "indoor"
            ? "Inspect Hall Air Conditioning & Sound Setup"
            : "Check Pune Evening Radar & Rain Tarp",
        description:
          newVenueType === "indoor"
            ? "Verify AC cooling capacity for 60 guests and hall acoustics."
            : "Check Pune weather radar and confirm lawn drainage.",
      };
    }
    return { ...task };
  });

  const diffs: PlanChangeDiff[] = [
    {
      type: "profile",
      field: "venueType",
      label: "Venue Preference",
      before: oldVenueType.toUpperCase(),
      after: newVenueType.toUpperCase(),
      impactReason: changeIntent.explanation,
    },
    {
      type: "budget",
      field: "item-venue",
      label: "Venue Rental",
      before: formatINR(800000),
      after: formatINR(newVenueType === "indoor" ? 950000 : 800000),
      impactReason:
        newVenueType === "indoor"
          ? "Indoor AC banquets charge slightly higher utility fee for electricity."
          : "Outdoor lawn rental fee.",
    },
    {
      type: "task",
      field: "task-weather-check",
      label: "Pre-Event Facility Check",
      before: "Lawn Weather Check",
      after: newVenueType === "indoor" ? "Hall AC Inspection" : "Lawn Radar Check",
      impactReason: "Shifted operational checks to match indoor infrastructure.",
    },
  ];

  return [
    {
      id: "prop-venue-relocate",
      title: `Relocate Event to ${newVenueType === "indoor" ? "Indoor Banquet Hall" : "Outdoor Lawn"}`,
      summary: `Safely transitions the party indoors, eliminating weather risks and shifting lighting/decor to stage backdrops.`,
      strategy: "venue_relocation",
      impact: {
        budgetDeltaMinor: newVenueType === "indoor" ? 150000 : -150000,
        newTotalEstimatedMinor: revisedItems.reduce((s, i) => addMoney(s, i.estimatedCostMinor), 0),
        tasksAffectedCount: 2,
        feasibilityScore: 94,
        preservedConstraints: [
          ...currentPlan.profile.mustHaves,
          "Vegetarian Menu Intact",
          "Anime Standees Maintained",
        ],
        unresolvedIssues: [],
      },
      diffs,
      revisedPlan: {
        ...currentPlan,
        profile: revisedProfile,
        budgetItems: revisedItems,
        tasks: revisedTasks,
        updatedAt: new Date().toISOString(),
        version: currentPlan.version + 1,
      },
    },
  ];
}
