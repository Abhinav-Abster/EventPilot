import React from "react";
import { X } from "lucide-react";
import { VendorRecord, VendorBookingStatus } from "../../../lib/types/event";
import { paiseToRupees, rupeesToPaise } from "../../../lib/budget/moneyUtils";

interface VendorEditModalProps {
  editingVendor: VendorRecord | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (v: VendorRecord) => void;
}

/**
 * Modal dialog allowing updates to vendor booking status, quotes, and contact information.
 */
export function VendorEditModal({
  editingVendor,
  onClose,
  onSubmit,
  onChange,
}: VendorEditModalProps) {
  if (!editingVendor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-black max-w-md w-full shadow-hard-8 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-bauhausBlue text-white border-b-4 border-black">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
            EDIT VENDOR CONTRACT
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-white bg-white text-black hover:bg-bauhausRed hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              NAME
            </label>
            <input
              type="text"
              required
              value={editingVendor.name}
              onChange={(e) => onChange({ ...editingVendor, name: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                QUOTE (₹)
              </label>
              <input
                type="number"
                value={paiseToRupees(editingVendor.estimatedQuoteMinor)}
                onChange={(e) =>
                  onChange({
                    ...editingVendor,
                    estimatedQuoteMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              />
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                BOOKING STATUS
              </label>
              <select
                value={editingVendor.bookingStatus}
                onChange={(e) =>
                  onChange({
                    ...editingVendor,
                    bookingStatus: e.target.value as VendorBookingStatus,
                  })
                }
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              >
                <option value="planned">PLANNED</option>
                <option value="contacted">CONTACTED</option>
                <option value="quote_received">QUOTE RECEIVED</option>
                <option value="shortlisted">SHORTLISTED</option>
                <option value="booked">BOOKED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              NOTES
            </label>
            <textarea
              rows={2}
              value={editingVendor.notes}
              onChange={(e) => onChange({ ...editingVendor, notes: e.target.value })}
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
              className="btn-bauhaus px-6 py-2 bg-bauhausBlue text-white hover:bg-bauhausBlue/90 border-2 border-black uppercase tracking-widest font-black shadow-hard-3"
            >
              SAVE SPECIFICATIONS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
