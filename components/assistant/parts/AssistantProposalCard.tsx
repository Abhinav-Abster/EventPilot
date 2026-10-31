import React from "react";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import { ReplanningProposal } from "../../../lib/types/event";

interface AssistantProposalCardProps {
  proposal: ReplanningProposal;
  isApplied: boolean;
  onViewComparison: () => void;
  onApply: () => void;
}

export function AssistantProposalCard({
  proposal,
  isApplied,
  onViewComparison,
  onApply,
}: AssistantProposalCardProps) {
  return (
    <div className="border-4 border-black bg-white p-6 space-y-5 shadow-[6px_6px_0px_0px_black]">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest bg-[#F0C020] text-black border border-black px-2 py-0.5 font-bold">
            CALCULATED PROPOSAL
          </span>
          <h2 className="font-display font-black text-xl text-black mt-2 uppercase tracking-tight">
            {proposal.title}
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-3 py-1 font-bold">
          {proposal.impact.feasibilityScore}% FEASIBLE
        </span>
      </div>

      <p className="font-sans font-medium text-xs sm:text-sm text-black leading-relaxed">
        {proposal.summary}
      </p>

      {/* Preserved Requirements */}
      {proposal.impact.preservedConstraints.length > 0 && (
        <div className="p-4 border-2 border-black bg-[#F0C020]/20 space-y-2 font-mono text-xs">
          <span className="text-[11px] font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={16} strokeWidth={2.5} className="text-[#1040C0]" />
            PRESERVED NON-NEGOTIABLES:
          </span>
          <div className="flex flex-wrap gap-2">
            {proposal.impact.preservedConstraints.map((c, i) => (
              <span
                key={i}
                className="text-[10px] border-2 border-black bg-white px-2.5 py-1 text-black uppercase font-bold shadow-[2px_2px_0px_0px_black]"
              >
                [✓] {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Diffs Preview */}
      <div className="space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-black block">
          MATERIAL MODIFICATIONS:
        </span>
        <div className="divide-y-2 divide-black border-2 border-black text-xs font-mono">
          {proposal.diffs.slice(0, 3).map((diff, i) => (
            <div key={i} className="p-3 bg-white">
              <span className="font-bold text-black uppercase block">{diff.label}</span>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="line-through text-gray-500 font-bold">{diff.before}</span>
                <ArrowRight size={14} strokeWidth={2} />
                <span className="font-bold text-[#1040C0]">{diff.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black font-mono">
        {isApplied ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-black bg-[#121212] text-white border-2 border-black shadow-[4px_4px_0px_0px_black]">
            <Check size={16} strokeWidth={3} className="text-[#F0C020]" /> APPLIED TO ACTIVE PLAN
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onViewComparison}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-bold border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_black] btn-bauhaus hover:bg-gray-100"
            >
              VIEW COMPARISON
            </button>
            <button
              type="button"
              onClick={onApply}
              className="px-6 py-2.5 text-xs uppercase tracking-widest font-black bg-[#D02020] text-white border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus hover:bg-[#D02020]/90"
            >
              ACCEPT & APPLY
            </button>
          </>
        )}
      </div>
    </div>
  );
}
