"use client";

import React from "react";
import {
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { formatINR } from "../../lib/budget/moneyUtils";

export function ReplanningModal() {
  const { activeProposal, applyProposal, rejectProposal } = usePlan();

  if (!activeProposal) return null;

  const isSavings = activeProposal.impact.budgetDeltaMinor <= 0;
  const absDelta = Math.abs(activeProposal.impact.budgetDeltaMinor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-title"
    >
      <div className="bg-[#F0F0F0] border-4 border-black shadow-[8px_8px_0px_0px_black] max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-[#121212] text-white p-8 border-b-4 border-black space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-3 font-mono text-xs uppercase tracking-widest text-[#F0C020]">
            <span className="flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D02020] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#1040C0] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#F0C020] inline-block shape-triangle" />
              <span>DETERMINISTIC REPLANNING PROPOSAL</span>
            </span>
            <span className="border-2 border-white px-2.5 py-0.5 text-white font-black bg-black">
              {activeProposal.impact.feasibilityScore}% FEASIBILITY
            </span>
          </div>

          <h2 id="proposal-title" className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            {activeProposal.title}
          </h2>

          <p className="font-sans font-medium text-xs sm:text-sm text-gray-200 leading-relaxed">
            {activeProposal.summary}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto bg-[#F0F0F0]">
          {/* Key Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="border-2 border-black bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_0px_black]">
              <span className="text-[10px] uppercase tracking-wider text-black font-bold block">
                BUDGET DELTA
              </span>
              <div className="text-xl font-black text-black">
                {isSavings ? `-${formatINR(absDelta)}` : `+${formatINR(absDelta)}`}
              </div>
              <p className="text-[10px] text-[#1040C0] font-bold uppercase">
                {isSavings ? "CAPITAL CONSERVED" : "CAPITAL INCREMENT"}
              </p>
            </div>

            <div className="border-2 border-black bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_0px_black]">
              <span className="text-[10px] uppercase tracking-wider text-black font-bold block">
                REVISED ESTIMATE
              </span>
              <div className="text-xl font-black text-black">
                {formatINR(activeProposal.impact.newTotalEstimatedMinor)}
              </div>
              <p className="text-[10px] text-gray-600 font-bold uppercase">
                SYNCHRONIZED TOTAL
              </p>
            </div>

            <div className="border-2 border-black bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_0px_black]">
              <span className="text-[10px] uppercase tracking-wider text-black font-bold block">
                DIRECTIVES AFFECTED
              </span>
              <div className="text-xl font-black text-black">
                {activeProposal.impact.tasksAffectedCount}
              </div>
              <p className="text-[10px] text-[#D02020] font-bold uppercase">
                SCHEDULE RECALCULATED
              </p>
            </div>
          </div>

          {/* Preserved Protected Constraints */}
          {activeProposal.impact.preservedConstraints.length > 0 && (
            <div className="border-4 border-black p-5 bg-[#F0C020] shadow-[4px_4px_0px_0px_black] space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-black">
                <ShieldCheck size={18} strokeWidth={2.5} className="text-[#1040C0]" />
                <span>PROTECTED NON-NEGOTIABLES PRESERVED:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeProposal.impact.preservedConstraints.map((item, idx) => (
                  <span
                    key={idx}
                    className="border-2 border-black bg-white px-3 py-1 text-black text-[11px] uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                  >
                    [✓] {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unresolved Conflicts / Warnings */}
          {activeProposal.impact.unresolvedIssues.length > 0 && (
            <div className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_black] space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[#D02020]">
                <AlertTriangle size={18} strokeWidth={2.5} />
                <span>OPERATIONAL ITEMS REQUIRING ATTENTION:</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono text-black font-medium">
                {activeProposal.impact.unresolvedIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-black text-[#D02020]">[{idx + 1}]</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-Side Diff Table */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-black inline-block" />
              <span>MATERIAL SPECIFICATION MODIFICATIONS:</span>
            </h3>
            <div className="border-4 border-black divide-y-2 divide-black text-xs font-mono bg-white shadow-[4px_4px_0px_0px_black]">
              {activeProposal.diffs.map((diff, idx) => (
                <div key={idx} className="p-4 hover:bg-[#F0F0F0] transition-colors duration-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-black uppercase">{diff.label}</span>
                    <span className="text-[10px] uppercase tracking-wider border-2 border-black px-2 py-0.5 bg-[#F0C020] text-black font-bold">
                      {diff.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-1.5 font-bold">
                    <span className="line-through text-gray-500">
                      {diff.before}
                    </span>
                    <ArrowRight size={14} strokeWidth={2} />
                    <span className="text-[#1040C0]">
                      {diff.after}
                    </span>
                  </div>
                  <p className="font-sans font-medium text-xs text-gray-700 leading-relaxed">
                    {diff.impactReason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-4 border-black p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <button
            type="button"
            onClick={rejectProposal}
            className="w-full sm:w-auto px-6 py-3 border-2 border-black bg-white hover:bg-gray-100 text-black uppercase tracking-wider font-bold btn-bauhaus transition-colors duration-200"
          >
            DISCARD (PRESERVE CURRENT PLAN)
          </button>

          <button
            type="button"
            onClick={() => applyProposal(activeProposal)}
            className="w-full sm:w-auto px-8 py-3 bg-[#D02020] text-white hover:bg-[#D02020]/90 border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus uppercase tracking-widest font-black transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={3} />
            <span>ACCEPT & COMMIT PROPOSAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
