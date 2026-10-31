import React from "react";
import { X } from "lucide-react";
import { BudgetItem } from "../../../lib/types/event";
import { paiseToRupees, rupeesToPaise } from "../../../lib/budget/moneyUtils";

interface BudgetItemEditModalProps {
  editingItem: BudgetItem | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (updated: BudgetItem) => void;
}

export function BudgetItemEditModal({
  editingItem,
  onClose,
  onSave,
  onChange,
}: BudgetItemEditModalProps) {
  if (!editingItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-[#1040C0] text-white border-b-4 border-black">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
            EDIT EXPENSE ITEM
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-white bg-white text-black hover:bg-[#D02020] hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
              ITEM NAME
            </label>
            <input
              type="text"
              required
              value={editingItem.name}
              onChange={(e) => onChange({ ...editingItem, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                ESTIMATED (₹)
              </label>
              <input
                type="number"
                value={paiseToRupees(editingItem.estimatedCostMinor)}
                onChange={(e) =>
                  onChange({
                    ...editingItem,
                    estimatedCostMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
              />
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                ACTUAL SPENT (₹)
              </label>
              <input
                type="number"
                value={paiseToRupees(editingItem.actualCostMinor)}
                onChange={(e) =>
                  onChange({
                    ...editingItem,
                    actualCostMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 font-black uppercase tracking-wider text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingItem.flexible}
                onChange={(e) => onChange({ ...editingItem, flexible: e.target.checked })}
                className="w-4 h-4 border-2 border-black accent-[#D02020]"
              />
              <span>FLEXIBLE CUTS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editingItem.isProtected)}
                onChange={(e) => onChange({ ...editingItem, isProtected: e.target.checked })}
                className="w-4 h-4 border-2 border-black accent-[#D02020]"
              />
              <span>PROTECTED REQUIREMENT</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-bauhaus px-6 py-2 bg-[#1040C0] text-white hover:bg-[#1040C0]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
            >
              COMMIT CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
