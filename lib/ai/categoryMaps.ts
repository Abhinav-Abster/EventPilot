/**
 * Normalization mappings and validation sets converting informal AI category labels into domain constants.
 */
import {
  BUDGET_CATEGORIES,
  VENDOR_CATEGORIES,
  CREATIVE_IDEA_CATEGORIES,
  BudgetCategory,
  VendorCategory,
  CreativeIdeaCategory,
} from "../types/event";

/**
 * Set of all supported budget category identifiers for O(1) membership checks.
 */
export const VALID_BUDGET_CATEGORIES_SET = new Set<string>(BUDGET_CATEGORIES);

/**
 * Normalization lookup mapping aliases and informal category phrases to canonical BudgetCategory values.
 */
export const BUDGET_CATEGORY_MAP: Record<string, BudgetCategory> = {
  food: "food_beverage",
  catering: "food_beverage",
  beverage: "food_beverage",
  beverages: "food_beverage",
  drinks: "food_beverage",
  cake: "food_beverage",
  bakery: "food_beverage",
  dining: "food_beverage",
  decor: "decorations",
  decoration: "decorations",
  decorations: "decorations",
  flowers: "decorations",
  lighting: "decorations",
  stage: "decorations",
  photo: "photography",
  photos: "photography",
  photography: "photography",
  video: "photography",
  videography: "photography",
  media: "photography",
  entertainment: "entertainment",
  music: "entertainment",
  sound: "entertainment",
  audio: "entertainment",
  dj: "entertainment",
  artist: "entertainment",
  performer: "entertainment",
  venue: "venue",
  hall: "venue",
  lawn: "venue",
  space: "venue",
  rental: "venue",
  location: "venue",
  invitation: "invitations",
  invitations: "invitations",
  invites: "invitations",
  print: "invitations",
  stationery: "invitations",
  transport: "transportation",
  transportation: "transportation",
  logistics: "transportation",
  travel: "transportation",
  contingency: "contingency_reserve",
  contingency_reserve: "contingency_reserve",
  reserve: "contingency_reserve",
  buffer: "contingency_reserve",
  emergency: "contingency_reserve",
  misc: "miscellaneous",
  miscellaneous: "miscellaneous",
  other: "miscellaneous",
};

/**
 * Set of all supported vendor category identifiers for membership validation.
 */
export const VALID_VENDOR_CATEGORIES_SET = new Set<string>(VENDOR_CATEGORIES);

/**
 * Normalization lookup mapping vendor category aliases to canonical VendorCategory values.
 */
export const VENDOR_CATEGORY_MAP: Record<string, VendorCategory> = {
  food: "caterer",
  catering: "caterer",
  caterer: "caterer",
  caterers: "caterer",
  bakery: "caterer",
  cake: "caterer",
  baker: "caterer",
  decor: "decorator",
  decoration: "decorator",
  decorator: "decorator",
  decorators: "decorator",
  florist: "decorator",
  flowers: "decorator",
  photo: "photographer",
  photos: "photographer",
  photography: "photographer",
  photographer: "photographer",
  photographers: "photographer",
  videographer: "photographer",
  entertainment: "entertainment",
  music: "entertainment",
  sound: "entertainment",
  dj: "entertainment",
  venue: "venue",
  hall: "venue",
  lawn: "venue",
  transport: "transportation",
  transportation: "transportation",
  cab: "transportation",
  cabs: "transportation",
  invitation: "invitations",
  invitations: "invitations",
  printer: "invitations",
  print: "invitations",
  other: "other",
};

/**
 * Set of supported creative idea category keys for validation.
 */
export const VALID_IDEA_CATEGORIES_SET = new Set<string>(CREATIVE_IDEA_CATEGORIES);

/**
 * Normalization lookup mapping idea classification synonyms to canonical CreativeIdeaCategory values.
 */
export const IDEA_CATEGORY_MAP: Record<string, CreativeIdeaCategory> = {
  theme: "theme",
  concept: "theme",
  decor: "decor",
  decoration: "decor",
  styling: "decor",
  menu: "menu",
  food: "menu",
  catering: "menu",
  drink: "menu",
  drinks: "menu",
  activities: "activities",
  activity: "activities",
  entertainment: "activities",
  games: "activities",
  fun: "activities",
  invitation: "invitation",
  invitations: "invitation",
  invite: "invitation",
  gift: "return_gifts",
  gifts: "return_gifts",
  favors: "return_gifts",
  favor: "return_gifts",
  return_gifts: "return_gifts",
  schedule: "schedule",
  timeline: "schedule",
  flow: "schedule",
  weather: "weather_contingency",
  weather_contingency: "weather_contingency",
  rain: "weather_contingency",
};
