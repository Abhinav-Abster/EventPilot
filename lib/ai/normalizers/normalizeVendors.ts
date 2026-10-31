import {
  VendorRecord,
  VendorCategory,
  VendorBookingStatus,
  VendorPaymentStatus,
  VENDOR_CATEGORIES,
  VENDOR_BOOKING_STATUSES,
  VENDOR_PAYMENT_STATUSES,
} from "../../types/event";
import { isOneOf } from "../../utils/guards";
import { asRecord, text, integer } from "../parsingHelpers";
import { VALID_VENDOR_CATEGORIES_SET, VENDOR_CATEGORY_MAP } from "../categoryMaps";

function resolveVendorCategory(raw: unknown): VendorCategory {
  const normalized = text(raw, "other").toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const candidate = VALID_VENDOR_CATEGORIES_SET.has(normalized)
    ? normalized
    : VENDOR_CATEGORY_MAP[normalized] ?? "other";
  return isOneOf(VENDOR_CATEGORIES, candidate) ? candidate : "other";
}

function resolveContact(raw: unknown) {
  const contactObj = asRecord(raw) ?? {};
  return {
    contactPerson:
      typeof contactObj.contactPerson === "string" && contactObj.contactPerson.trim()
        ? contactObj.contactPerson.trim()
        : undefined,
    phone:
      contactObj.phone != null && String(contactObj.phone).trim()
        ? String(contactObj.phone).trim()
        : undefined,
    email:
      typeof contactObj.email === "string" && contactObj.email.trim()
        ? contactObj.email.trim()
        : undefined,
  };
}

export function normalizeVendors(rawList: unknown[]): VendorRecord[] {
  return rawList.map((value, index) => {
    const vendor = asRecord(value) ?? {};
    const bookingStatus: VendorBookingStatus = isOneOf(VENDOR_BOOKING_STATUSES, vendor.bookingStatus)
      ? vendor.bookingStatus
      : "planned";
    const paymentStatus: VendorPaymentStatus = isOneOf(VENDOR_PAYMENT_STATUSES, vendor.paymentStatus)
      ? vendor.paymentStatus
      : "unpaid";

    return {
      id: text(vendor.id, `ai-vendor-${index + 1}`),
      name: text(vendor.name, `Potential vendor ${index + 1}`),
      category: resolveVendorCategory(vendor.category),
      contact: resolveContact(vendor.contact),
      estimatedQuoteMinor: integer(vendor.estimatedQuoteMinor ?? vendor.quoteMinor ?? vendor.estimatedCostMinor, 0),
      actualQuoteMinor: integer(vendor.actualQuoteMinor, 0),
      bookingStatus,
      paymentStatus,
      notes: text(vendor.notes, "Research and obtain a quote before booking."),
      relatedTaskIds: Array.isArray(vendor.relatedTaskIds)
        ? vendor.relatedTaskIds.filter((id): id is string => typeof id === "string")
        : [],
    };
  });
}
