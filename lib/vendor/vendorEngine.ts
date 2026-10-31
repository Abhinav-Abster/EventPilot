import { VendorRecord, VendorCategory, VendorBookingStatus, VendorPaymentStatus } from "../types/event";

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: "Venue",
  caterer: "Catering",
  decorator: "Decorations",
  photographer: "Photography",
  entertainment: "DJ & Sound",
  transportation: "Logistics",
  invitations: "Stationery",
  other: "Other Services",
};

export const BOOKING_STATUS_CONFIG: Record<
  VendorBookingStatus,
  { label: string; color: string; badgeBg: string }
> = {
  planned: { label: "Planned", color: "text-slate-600", badgeBg: "bg-slate-100" },
  contacted: { label: "Contacted", color: "text-blue-700", badgeBg: "bg-blue-50" },
  quote_received: { label: "Quote Received", color: "text-purple-700", badgeBg: "bg-purple-50" },
  shortlisted: { label: "Shortlisted", color: "text-amber-700", badgeBg: "bg-amber-50" },
  booked: { label: "Booked", color: "text-emerald-700", badgeBg: "bg-emerald-50" },
  cancelled: { label: "Cancelled", color: "text-rose-700", badgeBg: "bg-rose-50" },
};

/**
 * Returns a baseline vendor list for a reference event.
 */
export function generateDefaultVendors(): VendorRecord[] {
  return [
    {
      id: "ven-lawn-1",
      name: "Green Meadows Open Lawn & Pavilion",
      category: "venue",
      contact: {
        contactPerson: "Mr. Rajesh Deshmukh",
        phone: "+91 98220 12345",
        email: "contact@greenmeadowspune.in",
      },
      estimatedQuoteMinor: 800000, // ₹8,000
      actualQuoteMinor: 800000,
      bookingStatus: "shortlisted",
      paymentStatus: "unpaid",
      notes: "Pune Kothrud lawn with seating for up to 80 guests. Lighting and lawn chairs included in rental.",
      relatedTaskIds: ["task-venue-lock", "task-weather-check"],
    },
    {
      id: "ven-cater-1",
      name: "Swad Pure Veg Caterers Pune",
      category: "caterer",
      contact: {
        contactPerson: "Chef Anand Joshi",
        phone: "+91 98901 67890",
        email: "events@swadpune.com",
      },
      estimatedQuoteMinor: 1800000, // ₹18,000
      actualQuoteMinor: 1750000,
      bookingStatus: "quote_received",
      paymentStatus: "unpaid",
      notes: "Specializes in Pune vegetarian events. Quote includes 2 mocktails, 2 starters, 3 main course dishes, live chaat, and gulab jamun.",
      relatedTaskIds: ["task-caterer-lock"],
    },
    {
      id: "ven-decor-1",
      name: "Akira Thematic & Balloon Studio",
      category: "decorator",
      contact: {
        contactPerson: "Neha Sharma",
        phone: "+91 97654 32109",
        email: "akira.studios.pune@gmail.com",
      },
      estimatedQuoteMinor: 500000, // ₹5,000
      actualQuoteMinor: 500000,
      bookingStatus: "contacted",
      paymentStatus: "unpaid",
      notes: "Experienced in anime & manga themed setups: customized Naruto/Ghibli standees, LED fairy light tunnels, and balloon arch.",
      relatedTaskIds: ["task-decor-plan", "task-day-setup"],
    },
    {
      id: "ven-photo-1",
      name: "Moments by Siddharth (Freelance)",
      category: "photographer",
      contact: {
        contactPerson: "Siddharth Kulkarni",
        phone: "+91 94220 45678",
        email: "siddharth.photos@gmail.com",
      },
      estimatedQuoteMinor: 350000, // ₹3,500
      actualQuoteMinor: 350000,
      bookingStatus: "shortlisted",
      paymentStatus: "unpaid",
      notes: "3 hours coverage for birthday. Delivers 100 color-graded digital photos + 1 reel within 4 days.",
      relatedTaskIds: ["task-photo-vendor"],
    },
    {
      id: "ven-cake-1",
      name: "The Sugar Art Studio Pune",
      category: "caterer",
      contact: {
        contactPerson: "Baker Tanvi",
        phone: "+91 99700 88221",
        email: "tanvi.cakes@sugarart.co.in",
      },
      estimatedQuoteMinor: 250000, // ₹2,500
      actualQuoteMinor: 250000,
      bookingStatus: "planned",
      paymentStatus: "unpaid",
      notes: "Eggless Belgian chocolate 2kg cake with custom anime edible wafer print / topper.",
      relatedTaskIds: ["task-anime-cake"],
    },
  ];
}
