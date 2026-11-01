import React from "react";
import { AlertCircle } from "lucide-react";

interface BudgetWarningsCardProps {
  warnings: string[];
}

export function BudgetWarningsCard({ warnings }: BudgetWarningsCardProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="border-4 border-black p-6 bg-bauhausRed text-white shadow-hard-6 space-y-3">
      <div className="flex items-center gap-3 border-b-2 border-white pb-2">
        <AlertCircle size={20} strokeWidth={2.5} className="text-white shrink-0" />
        <h2 className="font-mono uppercase tracking-widest text-xs font-black text-white">
          FINANCIAL AUDIT DISCREPANCIES ({warnings.length})
        </h2>
      </div>
      <ul className="space-y-1 text-xs font-bold font-mono text-white">
        {warnings.map((w, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span>[!]</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
