import { z } from "zod";
import {
  EVENT_TYPES,
  VENUE_TYPES,
  PLANNING_PRIORITIES,
  BUDGET_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  VENDOR_CATEGORIES,
  VENDOR_BOOKING_STATUSES,
  VENDOR_PAYMENT_STATUSES,
  CREATIVE_IDEA_CATEGORIES,
} from "../types/event";
import { VALID_DIETS } from "../ai/normalizers";
import { DEFAULT_DIETARY_PREFERENCES } from "../config/constants";

export const EventTypeSchema = z.enum(EVENT_TYPES);
export const VenueTypeSchema = z.enum(VENUE_TYPES);
export const DietaryPreferenceSchema = z.enum(VALID_DIETS);
export const PlanningPrioritySchema = z.enum(PLANNING_PRIORITIES);

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
  dietaryPreferences: z.array(DietaryPreferenceSchema).default([...DEFAULT_DIETARY_PREFERENCES]),
  accessibilityRequirements: z.array(z.string()).default([]),
  mustHaves: z.array(z.string()).default([]),
  excludedFeatures: z.array(z.string()).default([]),
  priorities: z.array(PlanningPrioritySchema).default(["food", "decor", "budget"]),
  notes: z.string().default(""),
});

export const BudgetCategorySchema = z.enum(BUDGET_CATEGORIES);

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

export const TaskPrioritySchema = z.enum(TASK_PRIORITIES);
export const TaskStatusSchema = z.enum(TASK_STATUSES);

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

export const VendorCategorySchema = z.enum(VENDOR_CATEGORIES);

export const VendorBookingStatusSchema = z.enum(VENDOR_BOOKING_STATUSES);
export const VendorPaymentStatusSchema = z.enum(VENDOR_PAYMENT_STATUSES);

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
  bookingStatus: VendorBookingStatusSchema.default("planned"),
  paymentStatus: VendorPaymentStatusSchema.default("unpaid"),
  notes: z.string().default(""),
  relatedTaskIds: z.array(z.string()).default([]),
});

export const CreativeIdeaCategorySchema = z.enum(CREATIVE_IDEA_CATEGORIES);

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
