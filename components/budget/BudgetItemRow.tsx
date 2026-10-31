"use client";

import React from "react";
import { ShieldCheck, Edit2, Trash2 } from "lucide-react";
import { BudgetItem } from "../../lib/types/event";
import { CATEGORY_LABELS } from "../../lib/budget/budgetEngine";
import { formatINR } from "../../lib/budget/moneyUtils";

export interface BudgetItemRowProps {
  item: BudgetItem;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
}

export const BudgetItemRow = React.memo(function BudgetItemRow({
  item,
  onEdit,
  onDelete,
}: BudgetItemRowProps) {
  return (
    <tr className="hover:bg-[#FFF9C4]/50 transition-colors">
      <td className="py-4 px-6">
        <div className="font-display font-black text-sm uppercase text-black">{item.name}</div>
        {item.notes && (
          <div className="font-sans text-xs text-black/70 mt-0.5 font-medium">
            {item.notes}
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <span className="border-2 border-black bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_black]">
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
      </td>
      <td className="py-4 px-4 font-black text-black text-sm">
        {formatINR(item.estimatedCostMinor)}
      </td>
      <td className="py-4 px-4 text-black font-bold">
        {item.actualCostMinor > 0 ? formatINR(item.actualCostMinor) : "—"}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5">
          {item.isProtected ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#D02020] text-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_black]">
              <ShieldCheck size={12} strokeWidth={2.5} />
              PROTECTED
            </span>
          ) : item.flexible ? (
            <span className="text-[10px] font-bold uppercase tracking-wider border border-black bg-white px-2 py-0.5 text-black">
              FLEXIBLE
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#1040C0] text-white border border-black px-2 py-0.5">
              FIXED
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 border-2 border-black bg-white hover:bg-[#F0C020] text-black shadow-[2px_2px_0px_0px_black] transition-all"
            title="Edit Item"
          >
            <Edit2 size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white text-black shadow-[2px_2px_0px_0px_black] transition-all"
            title="Delete Item"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </td>
    </tr>
  );
});
