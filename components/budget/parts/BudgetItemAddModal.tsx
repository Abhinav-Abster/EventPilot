import React from "react";
import { X } from "lucide-react";
import { ALL_BUDGET_CATEGORIES, CATEGORY_LABELS } from "../../../lib/budget/budgetEngine";
import { BudgetCategory } from "../../../lib/types/event";
import { BudgetFormData } from "../hooks/useBudgetForm";

interface BudgetItemAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: BudgetFormData;
  setName: (v: string) => void;
  setCategory: (v: BudgetCategory) => void;
  setEstimatedRupees: (v: string) => void;
  setFlexible: (v: boolean) => void;
  setIsProtected: (v: boolean) => void;
  setNotes: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal dialog facilitating the creation and validation of new event budget line items.
 */
export function BudgetItemAddModal({
  isOpen,
  onClose,
  form,
  setName,
  setCategory,
  setEstimatedRupees,
  setFlexible,
  setIsProtected,
  setNotes,
  onSubmit,
}: BudgetItemAddModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-black max-w-md w-full shadow-hard-8 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-bauhausYellow border-b-4 border-black">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
            ADD CUSTOM EXPENSE
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-bauhausRed hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              ITEM DESCRIPTION
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Return gift snack boxes"
              value={form.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                CATEGORY
              </label>
              <select
                value={form.category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              >
                {ALL_BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                ESTIMATED (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="2500"
                value={form.estimatedRupees}
                onChange={(e) => setEstimatedRupees(e.target.value)}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 font-black uppercase tracking-wider text-tiny">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.flexible}
                onChange={(e) => setFlexible(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-bauhausRed"
              />
              <span>FLEXIBLE CUTS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-bauhausRed"
              />
              <span>PROTECTED MUST-HAVE</span>
            </label>
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              NOTES
            </label>
            <input
              type="text"
              placeholder="Optional supplier context"
              value={form.notes}
              onChange={(e) => setNotes(e.target.value)}
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
              REGISTER ITEM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
