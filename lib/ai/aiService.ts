import { getGeminiClient, isGeminiConfigured, DEFAULT_GEMINI_MODEL } from "./geminiClient";
import { EVENT_INTAKE_SYSTEM_PROMPT, PLAN_GENERATION_SYSTEM_PROMPT, REPLANNING_SYSTEM_PROMPT } from "./prompts";
import {
  EventProfile,
  EventPlan,
  ReplanningProposal,
  BudgetItem,
  Task,
  VendorRecord,
  CreativeIdea,
} from "../types/event";
import { EventProfileSchema, EventPlanSchema } from "../schemas/eventSchemas";
import {
  parseConstraintIntent,
  generateReplanningProposals,
} from "../replanning/replanningEngine";
import { generateDefaultTasks, addDaysToDate, formatISODate } from "../timeline/timelineEngine";
import { generateDefaultVendors } from "../vendor/vendorEngine";
import { generatePersonalizedIdeas } from "../ideas/ideaEngine";
import { rupeesToPaise, formatINR } from "../budget/moneyUtils";

export interface IntakeResult {
  reply: string;
  extractedProfile: Partial<EventProfile>;
  isComplete: boolean;
  missingFields: string[];
  isDemo: boolean;
}

export interface PlanGenerationResult {
  plan: EventPlan;
  isDemo: boolean;
  modelUsed?: string;
}

export interface ReplanningResult {
  proposals: ReplanningProposal[];
  isDemo: boolean;
  explanation: string;
}

/**
 * Conversational intake handler: extracts structured fields from user message
 */
export async function processEventIntake(
  userMessage: string,
  currentProfile: Partial<EventProfile> = {}
): Promise<IntakeResult> {
  const client = getGeminiClient();

  if (client && isGeminiConfigured()) {
    try {
      const prompt = `
Current profile state: ${JSON.stringify(currentProfile)}
User message: "${userMessage}"

Analyze the user's message and extract any event details.
Return a valid JSON object with:
{
  "reply": "Concise, enthusiastic message responding to user, acknowledging details provided, and asking 1-2 targeted follow-ups if missing critical information",
  "extractedProfile": {
    "name": "string (optional)",
    "type": "birthday" | "wedding" | "community" | "corporate" | "other",
    "date": "YYYY-MM-DD (optional)",
    "location": { "city": "string", "venueType": "indoor" | "outdoor" | "hybrid" },
    "guestCount": number (optional),
    "totalBudgetMinor": number in Paise (₹40,000 = 4000000) (optional),
    "theme": "string",
    "dietaryPreferences": ["vegetarian" | "non-vegetarian" | "vegan" | "jain"],
    "mustHaves": ["string"],
    "notes": "string"
  },
  "isComplete": boolean,
  "missingFields": ["string"]
}
`;

      const response = await client.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: [
          { role: "user", parts: [{ text: `${EVENT_INTAKE_SYSTEM_PROMPT}\n\n${prompt}` }] },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          reply: parsed.reply || "Got it! Here is what I gathered from your event request.",
          extractedProfile: { ...currentProfile, ...parsed.extractedProfile },
          isComplete: Boolean(parsed.isComplete),
          missingFields: parsed.missingFields || [],
          isDemo: false,
        };
      }
    } catch (e) {
      console.warn("Live Gemini intake failed, gracefully falling back to deterministic intake:", e);
    }
  }

  // Deterministic Offline / Demo Intake Parser
  return deterministicIntakeParser(userMessage, currentProfile);
}

/**
 * Deterministic intake heuristic for offline & demo modes
 */
function deterministicIntakeParser(
  userMessage: string,
  current: Partial<EventProfile>
): IntakeResult {
  const msg = userMessage.toLowerCase();
  const extracted: Partial<EventProfile> = { ...current };

  // 1. Detect Event Type
  if (msg.includes("birthday") || msg.includes("sister") || msg.includes("bday")) {
    extracted.type = "birthday";
    if (!extracted.name) extracted.name = "Sister's Milestone Birthday";
  } else if (msg.includes("wedding") || msg.includes("shaadi") || msg.includes("marriage")) {
    extracted.type = "wedding";
    if (!extracted.name) extracted.name = "Dream Wedding Celebration";
  } else if (msg.includes("community") || msg.includes("diwali") || msg.includes("festival")) {
    extracted.type = "community";
    if (!extracted.name) extracted.name = "Community Cultural Gathering";
  }

  // 2. City
  if (msg.includes("pune")) {
    extracted.location = {
      ...(extracted.location || { venueType: "outdoor" }),
      city: "Pune",
    };
  } else if (msg.includes("mumbai")) {
    extracted.location = {
      ...(extracted.location || { venueType: "outdoor" }),
      city: "Mumbai",
    };
  } else if (msg.includes("delhi") || msg.includes("bengaluru") || msg.includes("bangalore")) {
    const city = msg.includes("delhi") ? "Delhi" : "Bengaluru";
    extracted.location = {
      ...(extracted.location || { venueType: "outdoor" }),
      city,
    };
  }

  // 3. Venue Type
  if (msg.includes("outdoor") || msg.includes("lawn") || msg.includes("garden")) {
    extracted.location = {
      ...(extracted.location || { city: "Pune" }),
      venueType: "outdoor",
    };
  } else if (msg.includes("indoor") || msg.includes("hall") || msg.includes("banquet")) {
    extracted.location = {
      ...(extracted.location || { city: "Pune" }),
      venueType: "indoor",
    };
  }

  // 4. Guest Count
  const guestMatch = msg.match(/(\d+)\s*(?:people|guests?|pax|heads?)/);
  if (guestMatch) {
    extracted.guestCount = parseInt(guestMatch[1], 10);
  }

  // 5. Budget
  const budgetMatch =
    msg.match(/(?:budget|spend|cost)\s*(?:is|of|around|approx|equals|=|to)?\s*₹?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|lakh|thousand)?/i) ||
    msg.match(/₹\s*(\d[\d,]*(?:\.\d+)?)\s*(k|lakh|thousand)?/i);

  if (budgetMatch) {
    let num = parseFloat(budgetMatch[1].replace(/,/g, ""));
    const unit = (budgetMatch[2] || "").toLowerCase();
    if (unit === "k" || unit === "thousand") num *= 1000;
    if (unit === "lakh") num *= 100000;
    if (num >= 100 && num <= 10000000) {
      extracted.totalBudgetMinor = rupeesToPaise(num);
    }
  }

  // 6. Theme
  if (msg.includes("anime") || msg.includes("manga") || msg.includes("ghibli")) {
    extracted.theme = "Anime & Manga Aesthetics (Studio Ghibli & Shonen)";
    extracted.mustHaves = Array.from(
      new Set([...(extracted.mustHaves || []), "Anime-Themed Decor & Cake"])
    );
  }

  // 7. Dietary
  if (msg.includes("vegetarian") || msg.includes("veg") || msg.includes("pure veg")) {
    extracted.dietaryPreferences = ["vegetarian"];
    extracted.mustHaves = Array.from(
      new Set([...(extracted.mustHaves || []), "100% Pure Vegetarian Food"])
    );
  }

  // Check completeness
  const missing: string[] = [];
  if (!extracted.guestCount) missing.push("Guest count");
  if (!extracted.totalBudgetMinor) missing.push("Total budget");
  if (!extracted.location?.city) missing.push("City / Location");
  if (!extracted.date) {
    // Default to 25 days out if unspecified
    extracted.date = addDaysToDate(formatISODate(new Date()), 25);
  }

  let reply = "";
  if (missing.length === 0) {
    reply = `Brilliant! I have captured your event parameters: ${
      extracted.name || "Event"
    } in ${extracted.location?.city} for ${extracted.guestCount} guests, with a budget of ${formatINR(
      extracted.totalBudgetMinor || 4000000
    )}, featuring a ${extracted.theme || "custom"} theme and ${
      extracted.dietaryPreferences?.join(", ") || "vegetarian"
    } catering. You can review the details below and generate the comprehensive plan.`;
  } else {
    reply = `Great start! I've noted down your preferences. To make the plan complete, could you please confirm the ${missing.join(
      " and "
    )}?`;
  }

  return {
    reply,
    extractedProfile: extracted,
    isComplete: missing.length === 0,
    missingFields: missing,
    isDemo: true,
  };
}

/**
 * Generates an end-to-end event plan from profile
 */
export async function generateFullEventPlan(
  profileInput: Partial<EventProfile>
): Promise<PlanGenerationResult> {
  const targetDate = profileInput.date || addDaysToDate(formatISODate(new Date()), 25);

  const fullProfile: EventProfile = {
    id: profileInput.id || "ep-" + Math.random().toString(36).substring(2, 9),
    name: profileInput.name || "Aanya's 18th Anime Birthday Bash",
    type: profileInput.type || "birthday",
    date: targetDate,
    time: profileInput.time || "17:30",
    location: {
      city: profileInput.location?.city || "Pune",
      venueType: profileInput.location?.venueType || "outdoor",
      venueName: profileInput.location?.venueName || "Green Meadows Open Lawn, Pune",
    },
    guestCount: profileInput.guestCount || 60,
    totalBudgetMinor: profileInput.totalBudgetMinor || 4000000, // ₹40,000
    currency: "INR",
    theme: profileInput.theme || "Anime & Manga Aesthetics",
    dietaryPreferences: profileInput.dietaryPreferences || ["vegetarian"],
    accessibilityRequirements: profileInput.accessibilityRequirements || ["Wheelchair ramp"],
    mustHaves: profileInput.mustHaves?.length
      ? profileInput.mustHaves
      : ["Anime-Themed Decor & Cake", "100% Pure Vegetarian Food"],
    excludedFeatures: profileInput.excludedFeatures || ["Alcohol"],
    priorities: profileInput.priorities || ["food", "decor", "budget"],
    notes: profileInput.notes || "Curated celebration planned with EventPilot.",
  };

  const client = getGeminiClient();

  if (client && isGeminiConfigured()) {
    try {
      const prompt = `
Generate a comprehensive event plan for this profile:
${JSON.stringify(fullProfile, null, 2)}

Provide:
1. "budgetItems": Realistic array of budget items (venue, food_beverage, decorations, photography, entertainment, invitations, contingency_reserve) whose estimatedCostMinor sum exactly matches or is slightly under ${fullProfile.totalBudgetMinor}. All numbers in paise (₹1 = 100 paise).
2. "tasks": Array of dependency-aware tasks with relativeDays (e.g. -21, -14, -7, 0) and dependencies.
3. "ideas": Array of personalized creative suggestions (theme, menu, decor, activities, return_gifts, weather_contingency).
`;

      const response = await client.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: [
          { role: "user", parts: [{ text: `${PLAN_GENERATION_SYSTEM_PROMPT}\n\n${prompt}` }] },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.budgetItems && parsed.tasks) {
          const generatedPlan: EventPlan = {
            profile: fullProfile,
            budgetItems: parsed.budgetItems,
            tasks: parsed.tasks,
            vendors: generateDefaultVendors(),
            ideas: parsed.ideas || generatePersonalizedIdeas(fullProfile),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          };

          return {
            plan: generatedPlan,
            isDemo: false,
            modelUsed: DEFAULT_GEMINI_MODEL,
          };
        }
      }
    } catch (e) {
      console.warn("Live Gemini plan generation failed, using deterministic generation:", e);
    }
  }

  // Deterministic plan generation
  const tasks = generateDefaultTasks(
    targetDate,
    fullProfile.location.venueType === "outdoor"
  );
  const vendors = generateDefaultVendors();
  const ideas = generatePersonalizedIdeas(fullProfile);

  // Allocate items scaled to totalBudgetMinor
  const budgetRatio = fullProfile.totalBudgetMinor / 4000000;

  const budgetItems: BudgetItem[] = [
    {
      id: "bi-venue",
      category: "venue",
      name: `${fullProfile.location.venueType === "outdoor" ? "Outdoor Lawn" : "Banquet Hall"} Rental`,
      estimatedCostMinor: Math.round(800000 * budgetRatio),
      actualCostMinor: Math.round(800000 * budgetRatio),
      flexible: false,
      isProtected: false,
      notes: "4-hour evening booking with furniture and basic lighting.",
    },
    {
      id: "bi-catering",
      category: "food_beverage",
      name: `${fullProfile.dietaryPreferences.join("/")} Buffet (${fullProfile.guestCount} guests)`,
      estimatedCostMinor: Math.round(1800000 * budgetRatio),
      actualCostMinor: Math.round(1750000 * budgetRatio),
      flexible: false,
      isProtected: true,
      notes: "Welcome mocktails, 2 starters, 3 mains, live counter, and dessert.",
    },
    {
      id: "bi-cake",
      category: "food_beverage",
      name: `Custom 2kg Themed Birthday Cake`,
      estimatedCostMinor: Math.round(250000 * budgetRatio),
      actualCostMinor: Math.round(250000 * budgetRatio),
      flexible: true,
      isProtected: true,
      notes: "Handcrafted theme cake from artisanal bakery.",
    },
    {
      id: "bi-decor",
      category: "decorations",
      name: "Thematic Stage Backdrop & Entrance Arch",
      estimatedCostMinor: Math.round(500000 * budgetRatio),
      actualCostMinor: Math.round(500000 * budgetRatio),
      flexible: true,
      isProtected: true,
      notes: "Custom character standees and fairy lights.",
    },
    {
      id: "bi-photo",
      category: "photography",
      name: "Freelance Photographer (3 Hours Coverage)",
      estimatedCostMinor: Math.round(350000 * budgetRatio),
      actualCostMinor: Math.round(350000 * budgetRatio),
      flexible: true,
      isProtected: false,
      notes: "Candid portraits, group photos, and digital gallery.",
    },
    {
      id: "bi-sound",
      category: "entertainment",
      name: "Sound System Rental & Mics",
      estimatedCostMinor: Math.round(100000 * budgetRatio),
      actualCostMinor: Math.round(100000 * budgetRatio),
      flexible: true,
      isProtected: false,
      notes: "PA system for background music and games.",
    },
    {
      id: "bi-invites",
      category: "invitations",
      name: "Digital Animated Video Invites",
      estimatedCostMinor: Math.round(50000 * budgetRatio),
      actualCostMinor: Math.round(50000 * budgetRatio),
      flexible: true,
      isProtected: false,
      notes: "Motion graphic invite sent via WhatsApp.",
    },
    {
      id: "bi-contingency",
      category: "contingency_reserve",
      name: "Contingency & Incidentals Reserve",
      estimatedCostMinor: Math.round(150000 * budgetRatio),
      actualCostMinor: 0,
      flexible: true,
      isProtected: false,
      notes: "Buffer for unexpected requirements.",
    },
  ];

  return {
    plan: {
      profile: fullProfile,
      budgetItems,
      tasks,
      vendors,
      ideas,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
    isDemo: true,
  };
}

/**
 * Adaptive replanning solver: parses natural language constraint change,
 * generates ranked proposals with transparent trade-offs and diffs.
 */
export async function executeReplanning(
  userQuery: string,
  currentPlan: EventPlan
): Promise<ReplanningResult> {
  const client = getGeminiClient();

  if (client && isGeminiConfigured()) {
    try {
      const prompt = `
Current Event Plan:
- Budget: ${formatINR(currentPlan.profile.totalBudgetMinor)}
- Guests: ${currentPlan.profile.guestCount}
- Venue: ${currentPlan.profile.location.venueType} in ${currentPlan.profile.location.city}
- Must-Haves: ${currentPlan.profile.mustHaves.join(", ")}
- Current Total Estimated: ${formatINR(
        currentPlan.budgetItems.reduce((s, i) => s + i.estimatedCostMinor, 0)
      )}

User requested change: "${userQuery}"

Analyze the change:
1. What fields changed?
2. How does it impact the budget, deadlines, and vendors?
3. Propose a balanced optimization that preserves protected constraints.
`;

      const response = await client.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: [
          { role: "user", parts: [{ text: `${REPLANNING_SYSTEM_PROMPT}\n\n${prompt}` }] },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        // Fallback or augment with deterministic validation
      }
    } catch (e) {
      console.warn("Live Gemini replanning failed, using deterministic replanning:", e);
    }
  }

  // Deterministic Replanning Engine
  const intent = parseConstraintIntent(userQuery, currentPlan);
  const proposals = generateReplanningProposals(currentPlan, intent);

  return {
    proposals,
    isDemo: true,
    explanation: intent.explanation,
  };
}
