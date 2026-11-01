import React from "react";
import { BudgetItem } from "../../../lib/types/event";
import { BudgetItemRow } from "../BudgetItemRow";

interface BudgetTableProps {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
}

export function BudgetTable({ items, onEdit, onDelete }: BudgetTableProps) {
  return (
    <div className="border-4 border-black bg-white shadow-hard-8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-bauhausBlack text-white uppercase text-tiny tracking-widest border-b-4 border-black">
            <tr>
              <th className="py-4 px-6 font-black">EXPENSE ITEM</th>
              <th className="py-4 px-4 font-black">CATEGORY</th>
              <th className="py-4 px-4 font-black">ESTIMATED</th>
              <th className="py-4 px-4 font-black">ACTUAL</th>
              <th className="py-4 px-4 font-black">STATUS</th>
              <th className="py-4 px-6 text-right font-black">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-black">
            {items.map((item) => (
              <BudgetItemRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
