"use client";

import React from "react";
import { Users, Phone, Mail, Edit2, Trash2 } from "lucide-react";
import {
  VendorRecord,
  VendorBookingStatus,
} from "../../lib/types/event";
import {
  VENDOR_CATEGORY_LABELS,
} from "../../lib/vendor/vendorEngine";
import { formatINR } from "../../lib/budget/moneyUtils";

export interface VendorCardProps {
  vendor: VendorRecord;
  index: number;
  onStatusChange: (id: string, status: VendorBookingStatus) => void;
  onEdit: (vendor: VendorRecord) => void;
  onDelete: (id: string) => void;
}

export const VendorCard = React.memo(function VendorCard({
  vendor,
  index,
  onStatusChange,
  onEdit,
  onDelete,
}: VendorCardProps) {
  // Alternate corner accents
  const cornerShape =
    index % 3 === 0
      ? "rounded-full bg-[#D02020]"
      : index % 3 === 1
      ? "rounded-none bg-[#1040C0]"
      : "shape-triangle bg-[#F0C020]";

  return (
    <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between space-y-6 relative">
      <span className={`w-4 h-4 ${cornerShape} border-2 border-black absolute top-4 right-4`} />

      <div className="space-y-4">
        <div className="border-b-4 border-black pb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block mb-1">
            {VENDOR_CATEGORY_LABELS[vendor.category]}
          </span>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
            {vendor.name}
          </h2>
        </div>

        {/* Quotes & Payment Status */}
        <div className="grid grid-cols-2 gap-4 p-4 border-2 border-black bg-[#F0F0F0] shadow-[3px_3px_0px_0px_black] font-mono text-xs">
          <div>
            <span className="text-black/60 block text-[10px] uppercase font-bold tracking-wider">
              CONTRACT QUOTE
            </span>
            <span className="font-black text-black text-lg block pt-0.5">
              {formatINR(vendor.estimatedQuoteMinor)}
            </span>
          </div>
          <div>
            <span className="text-black/60 block text-[10px] uppercase font-bold tracking-wider">
              PAYMENT STATUS
            </span>
            <span className="font-black text-black uppercase block pt-1">
              {vendor.paymentStatus.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-xs font-mono text-black pt-1">
          {vendor.contact.contactPerson && (
            <div className="flex items-center gap-2">
              <Users size={15} strokeWidth={2.5} className="text-[#D02020] shrink-0" />
              <span className="font-bold">{vendor.contact.contactPerson}</span>
            </div>
          )}
          {vendor.contact.phone && (
            <div className="flex items-center gap-2">
              <Phone size={15} strokeWidth={2.5} className="text-[#1040C0] shrink-0" />
              <span className="font-bold">{vendor.contact.phone}</span>
            </div>
          )}
          {vendor.contact.email && (
            <div className="flex items-center gap-2">
              <Mail size={15} strokeWidth={2.5} className="text-[#F0C020] shrink-0" />
              <span className="font-bold">{vendor.contact.email}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {vendor.notes && (
          <p className="text-xs text-black/80 font-medium bg-[#FFF9C4] p-3 border-2 border-black shadow-[2px_2px_0px_0px_black]">
            {vendor.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t-4 border-black">
        <div>
          <select
            value={vendor.bookingStatus}
            onChange={(e) =>
              onStatusChange(vendor.id, e.target.value as VendorBookingStatus)
            }
            className="text-xs font-mono font-black uppercase bg-[#F0F0F0] border-2 border-black px-3 py-1.5 text-black shadow-[2px_2px_0px_0px_black] focus:outline-none"
          >
            <option value="planned">PLANNED</option>
            <option value="contacted">CONTACTED</option>
            <option value="quote_received">QUOTE RECEIVED</option>
            <option value="shortlisted">SHORTLISTED</option>
            <option value="booked">BOOKED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(vendor)}
            className="p-2 border-2 border-black bg-white hover:bg-[#F0C020] text-black shadow-[2px_2px_0px_0px_black] transition-all"
            title="Edit Vendor"
          >
            <Edit2 size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(vendor.id)}
            className="p-2 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white text-black shadow-[2px_2px_0px_0px_black] transition-all"
            title="Delete Vendor"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});
