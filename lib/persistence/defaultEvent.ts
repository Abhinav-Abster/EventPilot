import { EventPlan, EventType } from "../types/event";
import { generateDefaultTasks, addDaysToDate, formatISODate } from "../timeline/timelineEngine";
import { generateDefaultVendors } from "../vendor/vendorEngine";
import { generatePersonalizedIdeas } from "../ideas/ideaEngine";
import { DEFAULT_CITY, DEFAULT_DIETARY_PREFERENCES } from "../config/constants";

export function createEmptyEventPlan(): EventPlan {
  const targetDate = addDaysToDate(formatISODate(new Date()), 25);

  return {
    profile: {
      id: "ep-new-event",
      name: "New Event",
      type: "other",
      date: targetDate,
      time: "18:00",
      location: { city: "To be decided", venueType: "unselected" },
      guestCount: 1,
      totalBudgetMinor: 10000,
      currency: "INR",
      theme: "To be decided",
      dietaryPreferences: [],
      accessibilityRequirements: [],
      mustHaves: [],
      excludedFeatures: [],
      priorities: ["budget"],
      notes: "Start by describing your event in Event Intake.",
    },
    budgetItems: [],
    tasks: [],
    vendors: [],
    ideas: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

export function createReferenceEventPlan(): EventPlan {
  // Event date set ~25 days into future from today
  const targetDate = addDaysToDate(formatISODate(new Date()), 25);

  const profile = {
    id: "ep-aanya-18th-anime",
    name: "Aanya's 18th Anime Birthday Bash",
    type: "birthday" as const,
    date: targetDate,
    time: "17:30",
    location: {
      city: "Pune",
      venueType: "outdoor" as const,
      venueName: "Green Meadows Open Lawn, Kothrud, Pune",
    },
    guestCount: 60,
    totalBudgetMinor: 4000000, // ₹40,000 (in Paise)
    currency: "INR" as const,
    theme: "Anime & Manga Aesthetics (Studio Ghibli & Shonen)",
    dietaryPreferences: ["vegetarian" as const],
    accessibilityRequirements: ["Ground level wheelchair access to lawn"],
    mustHaves: ["Anime-Themed Decor & Cake", "100% Pure Vegetarian Food", "Outdoor Evening Setup"],
    excludedFeatures: ["Alcohol", "Loud Firecrackers"],
    priorities: ["food" as const, "decor" as const, "budget" as const],
    notes:
      "Sister's milestone 18th birthday celebration. She is an avid manga fan. Target 60 close friends and family in Pune for a memorable outdoor evening.",
  };

  const budgetItems = [
    {
      id: "bi-venue",
      category: "venue" as const,
      name: "Green Meadows Lawn Rental (Evening 5 PM - 10 PM)",
      estimatedCostMinor: 800000, // ₹8,000
      actualCostMinor: 800000,
      flexible: false,
      isProtected: false,
      notes: "Includes lawn space, perimeter lights, 60 guest chairs, and restrooms.",
    },
    {
      id: "bi-catering",
      category: "food_beverage" as const,
      name: "Swad Pure Veg Buffet (60 guests @ ₹300/head)",
      estimatedCostMinor: 1800000, // ₹18,000
      actualCostMinor: 1750000,
      flexible: false,
      isProtected: true,
      notes: "100% vegetarian: 2 mocktails, 2 starters, 3 mains, live chaat, gulab jamun.",
    },
    {
      id: "bi-cake",
      category: "food_beverage" as const,
      name: "Custom 2kg Anime Fondant Cake (The Sugar Art Studio)",
      estimatedCostMinor: 250000, // ₹2,500
      actualCostMinor: 250000,
      flexible: true,
      isProtected: true,
      notes: "Eggless Belgian chocolate cake with custom manga wafer topper.",
    },
    {
      id: "bi-decor",
      category: "decorations" as const,
      name: "Anime Stage Backdrop, Standees & Balloon Arch",
      estimatedCostMinor: 500000, // ₹5,000
      actualCostMinor: 500000,
      flexible: true,
      isProtected: true,
      notes: "Custom character standees, organic sage/gold balloon arch, and fairy light canopy.",
    },
    {
      id: "bi-photo",
      category: "photography" as const,
      name: "Freelance Photographer (3 Hours Candid & Cake Cutting)",
      estimatedCostMinor: 350000, // ₹3,500
      actualCostMinor: 350000,
      flexible: true,
      isProtected: false,
      notes: "High-res color-graded digital gallery + 1 Instagram highlight reel.",
    },
    {
      id: "bi-sound",
      category: "entertainment" as const,
      name: "Portable Bluetooth PA Sound System Rental & Mics",
      estimatedCostMinor: 100000, // ₹1,000
      actualCostMinor: 100000,
      flexible: true,
      isProtected: false,
      notes: "Curated anime openings + Hindi pop playlist and trivia buzzers.",
    },
    {
      id: "bi-invites",
      category: "invitations" as const,
      name: "Bespoke Animated Video Invites & RSVP Tracking",
      estimatedCostMinor: 50000, // ₹500
      actualCostMinor: 50000,
      flexible: true,
      isProtected: false,
      notes: "WhatsApp motion graphic invite with RSVP Google Form link.",
    },
    {
      id: "bi-contingency",
      category: "contingency_reserve" as const,
      name: "Emergency Contingency Reserve",
      estimatedCostMinor: 150000, // ₹1,500 (3.75%)
      actualCostMinor: 0,
      flexible: true,
      isProtected: false,
      notes: "Unplanned supplies, extra water crates, or urgent local errands.",
    },
  ];

  const tasks = generateDefaultTasks(targetDate, true);
  const vendors = generateDefaultVendors();
  const ideas = generatePersonalizedIdeas(profile);

  return {
    profile,
    budgetItems,
    tasks,
    vendors,
    ideas,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

export function createCustomEventPlan(
  name = "New Celebration",
  type: EventType = "other",
  overrides: Partial<EventPlan["profile"]> = {}
): EventPlan {
  const targetDate = addDaysToDate(formatISODate(new Date()), 30);
  const eventId = "ep-" + Math.random().toString(36).substring(2, 9);
  const budgetMinor = overrides.totalBudgetMinor || 5000000;

  const profile = {
    id: eventId,
    name,
    type,
    date: overrides.date || targetDate,
    time: overrides.time || "18:00",
    location: {
      city: overrides.location?.city || DEFAULT_CITY,
      venueType: overrides.location?.venueType || "outdoor",
      venueName: overrides.location?.venueName || "",
    },
    guestCount: overrides.guestCount || 50,
    totalBudgetMinor: budgetMinor,
    currency: "INR" as const,
    theme: overrides.theme || `${name} Celebration`,
    dietaryPreferences: overrides.dietaryPreferences || [...DEFAULT_DIETARY_PREFERENCES],
    accessibilityRequirements: overrides.accessibilityRequirements || [],
    mustHaves: overrides.mustHaves || [],
    excludedFeatures: overrides.excludedFeatures || [],
    priorities: overrides.priorities || ["food" as const, "decor" as const, "budget" as const],
    notes: overrides.notes || `Planning for ${name}.`,
  };

  const tasks = generateDefaultTasks(profile.date, true);
  const vendors = generateDefaultVendors();
  const ideas = generatePersonalizedIdeas(profile);

  const budgetItems = [
    {
      id: "bi-venue-" + eventId.slice(-4),
      category: "venue" as const,
      name: "Venue Space Rental & Setup",
      estimatedCostMinor: Math.round(budgetMinor * 0.25),
      actualCostMinor: 0,
      flexible: true,
      isProtected: false,
      notes: "Space reservation, lighting, seating, and basic amenities.",
    },
    {
      id: "bi-food-" + eventId.slice(-4),
      category: "food_beverage" as const,
      name: "Catering & Refreshments",
      estimatedCostMinor: Math.round(budgetMinor * 0.45),
      actualCostMinor: 0,
      flexible: false,
      isProtected: true,
      notes: "Food service tailored to dietary needs.",
    },
    {
      id: "bi-decor-" + eventId.slice(-4),
      category: "decorations" as const,
      name: "Theme Decor & Lighting",
      estimatedCostMinor: Math.round(budgetMinor * 0.15),
      actualCostMinor: 0,
      flexible: true,
      isProtected: false,
      notes: "Atmosphere, balloon/flower styling, or backdrop installation.",
    },
    {
      id: "bi-contingency-" + eventId.slice(-4),
      category: "contingency_reserve" as const,
      name: "Emergency Contingency Reserve",
      estimatedCostMinor: Math.round(budgetMinor * 0.15),
      actualCostMinor: 0,
      flexible: true,
      isProtected: false,
      notes: "Buffer for unplanned needs and errands.",
    },
  ];

  return {
    profile,
    budgetItems,
    tasks,
    vendors,
    ideas,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}
