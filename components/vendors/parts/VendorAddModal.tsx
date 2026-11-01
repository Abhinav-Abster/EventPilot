import React from "react";
import { X } from "lucide-react";
import { VendorCategory, VendorBookingStatus, VendorPaymentStatus } from "../../../lib/types/event";
import { VENDOR_CATEGORY_LABELS } from "../../../lib/vendor/vendorEngine";

export interface NewVendorFormData {
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  estimatedQuote: string;
  bookingStatus: VendorBookingStatus;
  paymentStatus: VendorPaymentStatus;
  notes: string;
}

interface VendorAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: NewVendorFormData;
  onChange: (f: NewVendorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal dialog allowing registration of new vendors with category, quotes, and contact details.
 */
export function VendorAddModal({ isOpen, onClose, form, onChange, onSubmit }: VendorAddModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-black max-w-md w-full shadow-hard-8 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-bauhausRed text-white border-b-4 border-black">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
            ENROLL SERVICE VENDOR
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              VENDOR / ESTABLISHMENT NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pune Anime Decor Studio"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                DISCIPLINE
              </label>
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value as VendorCategory })}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              >
                {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                QUOTE (₹)
              </label>
              <input
                type="number"
                placeholder="5000"
                value={form.estimatedQuote}
                onChange={(e) => onChange({ ...form, estimatedQuote: e.target.value })}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                CONTACT PERSON
              </label>
              <input
                type="text"
                placeholder="Mr. Rajesh"
                value={form.contactPerson}
                onChange={(e) => onChange({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              />
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                PHONE
              </label>
              <input
                type="text"
                placeholder="+91 98220..."
                value={form.phone}
                onChange={(e) => onChange({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="vendor@pune.in"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              TERMS & NOTES
            </label>
            <textarea
              rows={2}
              placeholder="Deliverables covered, deposit terms, cancellation policies..."
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-bauhausCanvas text-black uppercase tracking-wider font-bold shadow-hard-2"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-bauhaus px-6 py-2 bg-bauhausRed text-white hover:bg-bauhausRed/90 border-2 border-black uppercase tracking-widest font-black shadow-hard-3"
            >
              ENROLL VENDOR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
