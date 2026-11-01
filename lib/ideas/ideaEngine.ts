/**
 * Generates personalized, thematic ideas deterministically from event profile parameters and guest constraints.
 */
import { CreativeIdea, EventProfile } from "../types/event";

function buildThemeIdea(isAnime: boolean): CreativeIdea {
  return {
    id: "idea-theme-1",
    category: "theme",
    title: isAnime
      ? "Enchanted Anime Garden (Studio Ghibli & Shonen Fusion)"
      : "Warm Twilight Garden Celebration",
    description: isAnime
      ? "Blends whimsical Ghibli forest aesthetics (fairy lights, paper lanterns, soot sprite plushies) with dynamic manga photo ops."
      : "A rustic evening celebration with warm fairy lights, floral centerpieces, and comfortable lounge seating.",
    whyItFits:
      "Directly honors the guest of honor's passion while utilizing Pune's evening weather for a magical atmosphere.",
    estimatedCostMinor: 400000,
    costRangeText: "₹3,500 - ₹5,000",
    implementationSteps: [
      "String warm-white fairy lights along trees and perimeter fence.",
      "Print high-resolution cardboard standees of sister's favorite 3 anime characters.",
      "Set up a Polaroid photo booth station with anime speech bubble props ('Nani?!', 'Dattebayo!').",
    ],
    constraints: ["Requires venue with accessible tree branches or poles for stringing lights"],
    tradeOffs: [
      "DIY standees save ₹4,000 compared to full 3D fiber statues but require 2 days printing advance.",
    ],
    isSaved: true,
  };
}

function buildMenuIdea(isVeg: boolean, theme: string): CreativeIdea {
  return {
    id: "idea-menu-1",
    category: "menu",
    title: isVeg
      ? "Gourmet Pure Vegetarian Feast with Japanese-Indian Fusion Live Counter"
      : "Deluxe Celebration Buffet",
    description:
      "100% vegetarian spread featuring Hakka noodles, crispy veg spring rolls, paneer teriyaki skewers alongside authentic Pune street chaat and rich North Indian curry with naan.",
    whyItFits: `Strictly complies with the 100% vegetarian mandate while infusing playful East-Asian flavors that match the ${theme} theme.`,
    estimatedCostMinor: 1800000,
    costRangeText: "₹280 - ₹340 per guest (₹16,800 - ₹20,400 total)",
    implementationSteps: [
      "Live Mocktail Bar: 'Blue Spirited Soda' & 'Peach Lychee Blossom'.",
      "Starters: Crispy Corn Chilly, Paneer Tikka, and Veg Dumplings with spicy sesame dip.",
      "Live Counter: Sev Puri, Dahi Puri, and Pav Bhaji.",
      "Main Course: Dal Makhani, Paneer Butter Masala, Jeera Rice, Assorted Tandoori Breads.",
      "Dessert: Custom Anime Wafer Cake & Hot Gulab Jamun with vanilla ice cream.",
    ],
    constraints: ["Requires 3 separate counter tables and 2 gas burners for hot service"],
    tradeOffs: [
      "Live chaat counter increases guest engagement, but requires 1 dedicated catering staff.",
    ],
    isSaved: true,
  };
}

function buildDecorIdea(): CreativeIdea {
  return {
    id: "idea-decor-1",
    category: "decor",
    title: "Manga Wall Photo Backdrop & Origami Crane Canopy",
    description:
      "A photo-worthy feature wall made of black-and-white manga page prints framed by an organic sage green and gold balloon arch, accented by 100 hanging pastel origami cranes.",
    whyItFits:
      "Creates an Instagram-ready focal point for the 18th milestone without expensive LED walls.",
    estimatedCostMinor: 350000,
    costRangeText: "₹3,000 - ₹4,500",
    implementationSteps: [
      "Print 40 manga panels on matte A3 sheets and affix to a 6x6 ft portable backdrop board.",
      "Assemble a 10-foot organic balloon arch using forest green, gold, and pastel peach balloons.",
      "Fold origami cranes using colored craft paper with friends as a pre-event activity.",
    ],
    constraints: ["Must be sheltered from high wind if placed outdoors"],
    tradeOffs: ["Paper prints must be shielded from direct moisture or lawn sprinklers."],
    isSaved: false,
  };
}

function buildActivitiesIdea(): CreativeIdea {
  return {
    id: "idea-activities-1",
    category: "activities",
    title: "Interactive Anime Trivia Battle & Character Silhouette Guessing",
    description:
      "A 30-minute fast-paced party game hosted by an enthusiastic friend or sibling using a portable speaker and smartphone buzzers.",
    whyItFits:
      "Bridges guests who are hardcore anime fans and family members through easy-to-play rounds and team banter.",
    estimatedCostMinor: 100000,
    costRangeText: "₹500 - ₹1,500",
    implementationSteps: [
      "Prepare a 15-question Google Slides deck with audio opening-theme snippets.",
      "Divide the 60 guests into 6 teams named after anime guilds/squads.",
      "Award quirky anime stickers and Japanese snack boxes (Pocky, matcha biscuits) to the winning squad.",
    ],
    constraints: ["Needs PA speaker with Bluetooth connectivity and microphone"],
    tradeOffs: ["Keep under 35 minutes so older relatives remain engaged."],
    isSaved: true,
  };
}

function buildInvitationIdea(): CreativeIdea {
  return {
    id: "idea-invitation-1",
    category: "invitation",
    title: "Animated WhatsApp Video Invitation ('Guild Quest Accepted')",
    description:
      "A 15-second retro 8-bit / anime-styled motion graphic invitation detailing the date, venue coordinates, and dress code with background anime OST music.",
    whyItFits:
      "Zero printing cost, 100% instant delivery to all 60 guests, and sets the thematic expectation immediately.",
    estimatedCostMinor: 50000,
    costRangeText: "₹0 (Canva DIY) - ₹1,000 (Fiverr freelancer)",
    implementationSteps: [
      "Draft wording: 'Calling all heroes! Assemble at Green Meadows Lawn for Aanya's 18th Birthday Quest!'",
      "Add RSVP button linking to a simple Google Form to track vegetarian preferences and attendance count.",
      "Send 2 weeks in advance with a reminder broadcast 3 days prior.",
    ],
    constraints: ["Guests must have WhatsApp or email"],
    tradeOffs: [
      "Saves ₹3,000 on physical cards, but older family may appreciate a phone call follow-up.",
    ],
    isSaved: false,
  };
}

function buildGiftsIdea(): CreativeIdea {
  return {
    id: "idea-gifts-1",
    category: "return_gifts",
    title: "Personalized Manga Bookmarks & Japanese Snack Bags",
    description:
      "Custom laminated bookmarks stamped with sister's birthday emblem, paired with imported Pocky sticks and green tea candies in Kraft paper pouches.",
    whyItFits:
      "Memorable, lightweight, utilitarian, and directly connects to the love for reading and manga.",
    estimatedCostMinor: 250000,
    costRangeText: "₹35 - ₹50 per guest",
    implementationSteps: [
      "Bulk order Japanese snacks from Pune specialty store or online importer.",
      "Print custom bookmarks on 350 GSM cardstock with tassel ribbons.",
      "Pack in jute/kraft pouches with a handwritten 'Thank you for celebrating with me' tag.",
    ],
    constraints: ["Order snacks at least 7 days before event to avoid shipping delays"],
    tradeOffs: ["Higher sentiment value than plastic knick-knacks, at negligible cost."],
    isSaved: false,
  };
}

function buildWeatherIdea(isOutdoor: boolean): CreativeIdea {
  return {
    id: "idea-weather-1",
    category: "weather_contingency",
    title: isOutdoor
      ? "Pune Evening Weather Contingency Protocol (Waterproof Pavilion & Bug Repellent)"
      : "Indoor Ambience & Airflow Optimization",
    description: isOutdoor
      ? "Arrangement with venue management to have the covered concrete pavilion pre-reserved in case of sudden evening drizzle or dew on Pune lawns."
      : "Ensure high-volume fans and AC temperature set at 22°C to keep the 60-person room fresh during games.",
    whyItFits:
      "Eliminates panic if Pune weather shifts during the 5:30 PM - 10:00 PM party window.",
    estimatedCostMinor: 150000,
    costRangeText: "₹0 - ₹2,000 (citronella diffusers & tarp standby)",
    implementationSteps: [
      "Confirm that the venue rental contract allows immediate relocation to the covered terrace if it rains.",
      "Place 4 herbal citronella torches around perimeter of lawn for evening mosquito control.",
      "Keep 10 large clear umbrellas on standby for guest arrival.",
    ],
    constraints: ["Requires upfront written agreement with lawn owner"],
    tradeOffs: ["Standby arrangement costs minimal advance deposit but guarantees peace of mind."],
    isSaved: true,
  };
}

/**
 * Deterministically generates rich, personalized creative suggestions
 * customized to the specific event profile, guest count, and theme.
 */
export function generatePersonalizedIdeas(profile: EventProfile): CreativeIdea[] {
  const isAnime =
    profile.theme.toLowerCase().includes("anime") || profile.notes.toLowerCase().includes("anime");
  const isOutdoor = profile.location.venueType === "outdoor";
  const isVeg = profile.dietaryPreferences.includes("vegetarian");

  return [
    buildThemeIdea(isAnime),
    buildMenuIdea(isVeg, profile.theme),
    buildDecorIdea(),
    buildActivitiesIdea(),
    buildInvitationIdea(),
    buildGiftsIdea(),
    buildWeatherIdea(isOutdoor),
  ];
}
