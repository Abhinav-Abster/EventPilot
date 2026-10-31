import React from "react";
import { formatINR } from "../../../lib/budget/moneyUtils";
import { BudgetSummary } from "../../../lib/types/event";

interface BudgetMetricsHeaderProps {
  summary: BudgetSummary;
  itemsCount: number;
}

export function BudgetMetricsHeader({ summary, itemsCount }: BudgetMetricsHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
        <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-black absolute top-4 right-4" />
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
            01 / TOTAL CEILING
          </span>
          <span className="font-display font-black text-3xl text-black block">
            {formatINR(summary.totalBudgetMinor)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
          MANDATED UPPER BOUND
        </span>
      </div>

      <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
        <span className="w-4 h-4 rounded-none bg-[#1040C0] border-2 border-black absolute top-4 right-4" />
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
            02 / ESTIMATED COMMIT
          </span>
          <span
            className={`font-display font-black text-3xl block ${
              summary.isOverspent ? "text-[#D02020]" : "text-black"
            }`}
          >
            {formatINR(summary.totalEstimatedMinor)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
          SUM OF {itemsCount} ITEMS
        </span>
      </div>

      <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
        <span className="w-4 h-4 shape-triangle bg-[#F0C020] border-b-2 border-black absolute top-4 right-4" />
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
            03 / BUFFER REMAINING
          </span>
          <span
            className={`font-display font-black text-3xl block ${
              summary.remainingEstimatedMinor >= 0 ? "text-black" : "text-[#D02020]"
            }`}
          >
            {formatINR(summary.remainingEstimatedMinor)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
          {summary.isOverspent ? "OVERRUN DEFICIT" : "UNCOMMITTED CAPITAL"}
        </span>
      </div>

      <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
        <span className="w-4 h-4 bg-black rotate-45 border border-black absolute top-4 right-4" />
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
            04 / CONTINGENCY
          </span>
          <span className="font-display font-black text-3xl text-black block">
            {formatINR(summary.contingencyMinor)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
          {summary.contingencyPercent}% HEDGE RESERVE
        </span>
      </div>
    </div>
  );
}
