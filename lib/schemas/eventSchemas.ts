import { z } from "zod";

export const EventTypeSchema = z.enum([
  "birthday",
  "wedding",
  "community",
  "corporate",
  "anniversary",
  "other",
]);

export const VenueTypeSchema = z.enum(["indoor", "outdoor", "hybrid", "unselected"]);

export const DietaryPreferenceSchema = z.enum([
  "vegetarian",
  "non-vegetarian",
  "vegan",
  "jain",
  "halal",
  "gluten-free",
  "nut-allergy",
]);

export const PlanningPrioritySchema = z.enum([
  "food",
  "decor",
  "photography",
  "entertainment",
  "venue",
  "budget",
]);

export const EventProfileSchema = z.object({
  id: z.string().default(() => "ep-" + Math.random().toString(36).substring(2, 9)),
  name: z.string().min(2, "Event name must be at least 2 characters").max(100),
  type: EventTypeSchema.default("birthday"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().default("18:00"),
  location: z.object({
    city: z.string().min(1, "City is required"),
    venueType: VenueTypeSchema.default("outdoor"),
    venueName: z.string().optional(),
  }),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(5000),
  totalBudgetMinor: z.number().int().min(10000, "Budget must be at least ₹100"), // 10,000 paise = ₹100
  currency: z.literal("INR").default("INR"),
  theme: z.string().default("General Celebration"),
  dietaryPreferences: z.array(DietaryPreferenceSchema).default(["vegetarian"]),
  accessibilityRequirements: z.array(z.string()).default([]),
  mustHaves: z.array(z.string()).default([]),
  excludedFeatures: z.array(z.string()).default([]),
  priorities: z.array(PlanningPrioritySchema).default(["food", "decor", "budget"]),
  notes: z.string().default(""),
});

export const BudgetCategorySchema = z.enum([
  "venue",
  "food_beverage",
  "decorations",
  "photography",
  "entertainment",
  "invitations",
  "transportation",
  "miscellaneous",
  "contingency_reserve",
]);

export const BudgetItemSchema = z.object({
  id: z.string().default(() => "bi-" + Math.random().toString(36).substring(2, 9)),
  category: BudgetCategorySchema,
  name: z.string().min(1),
  estimatedCostMinor: z.number().int().min(0),
  actualCostMinor: z.number().int().min(0).default(0),
  flexible: z.boolean().default(true),
  isProtected: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export const TaskPrioritySchema = z.enum(["urgent", "high", "medium", "low"]);
export const TaskStatusSchema = z.enum(["todo", "in_progress", "completed", "blocked"]);

export const TaskSchema = z.object({
  id: z.string().default(() => "t-" + Math.random().toString(36).substring(2, 9)),
  title: z.string().min(1),
  description: z.string().default(""),
  category: z.string().default("general"),
  priority: TaskPrioritySchema.default("medium"),
  relativeDays: z.number().int(),
  dueDate: z.string(),
  status: TaskStatusSchema.default("todo"),
  dependencies: z.array(z.string()).default([]),
  estimatedCostMinor: z.number().int().optional(),
  vendorId: z.string().optional(),
  isOverdue: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
});

export const VendorCategorySchema = z.enum([
  "venue",
  "caterer",
  "decorator",
  "photographer",
  "entertainment",
  "transportation",
  "invitations",
  "other",
]);

export const VendorRecordSchema = z.object({
  id: z.string().default(() => "v-" + Math.random().toString(36).substring(2, 9)),
  name: z.string().min(1),
  category: VendorCategorySchema,
  contact: z.object({
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).default({}),
  estimatedQuoteMinor: z.number().int().min(0),
  actualQuoteMinor: z.number().int().min(0).default(0),
  bookingStatus: z.enum([
    "planned",
    "contacted",
    "quote_received",
    "shortlisted",
    "booked",
    "cancelled",
  ]).default("planned"),
  paymentStatus: z.enum(["unpaid", "advance_paid", "fully_paid"]).default("unpaid"),
  notes: z.string().default(""),
  relatedTaskIds: z.array(z.string()).default([]),
});

export const CreativeIdeaCategorySchema = z.enum([
  "theme",
  "decor",
  "menu",
  "activities",
  "invitation",
  "return_gifts",
  "schedule",
  "weather_contingency",
]);

export const CreativeIdeaSchema = z.object({
  id: z.string().default(() => "ci-" + Math.random().toString(36).substring(2, 9)),
  category: CreativeIdeaCategorySchema,
  title: z.string().min(1),
  description: z.string(),
  whyItFits: z.string(),
  estimatedCostMinor: z.number().int().min(0),
  costRangeText: z.string().optional(),
  implementationSteps: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  tradeOffs: z.array(z.string()).default([]),
  isSaved: z.boolean().optional().default(false),
});

export const EventPlanSchema = z.object({
  profile: EventProfileSchema,
  budgetItems: z.array(BudgetItemSchema),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorRecordSchema),
  ideas: z.array(CreativeIdeaSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int().default(1),
});

export type ValidatedEventProfile = z.infer<typeof EventProfileSchema>;
export type ValidatedBudgetItem = z.infer<typeof BudgetItemSchema>;
export type ValidatedTask = z.infer<typeof TaskSchema>;
export type ValidatedVendorRecord = z.infer<typeof VendorRecordSchema>;
export type ValidatedCreativeIdea = z.infer<typeof CreativeIdeaSchema>;
export type ValidatedEventPlan = z.infer<typeof EventPlanSchema>;
