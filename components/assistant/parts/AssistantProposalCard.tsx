import React from "react";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import { ReplanningProposal } from "../../../lib/types/event";

interface AssistantProposalCardProps {
  proposal: ReplanningProposal;
  isApplied: boolean;
  onViewComparison: () => void;
  onApply: () => void;
}

/**
 * Displays an actionable replanning proposal with trade-offs, financial deltas, and acceptance actions.
 */
export function AssistantProposalCard({
  proposal,
  isApplied,
  onViewComparison,
  onApply,
}: AssistantProposalCardProps) {
  return (
    <div className="border-4 border-black bg-white p-6 space-y-5 shadow-hard-6">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <div>
          <span className="font-mono text-micro uppercase tracking-widest bg-bauhausYellow text-black border border-black px-2 py-0.5 font-bold">
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
        <div className="p-4 border-2 border-black bg-bauhausYellow/20 space-y-2 font-mono text-xs">
          <span className="text-tiny font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={16} strokeWidth={2.5} className="text-bauhausBlue" />
            PRESERVED NON-NEGOTIABLES:
          </span>
          <div className="flex flex-wrap gap-2">
            {proposal.impact.preservedConstraints.map((c, i) => (
              <span
                key={i}
                className="text-micro border-2 border-black bg-white px-2.5 py-1 text-black uppercase font-bold shadow-hard-2"
              >
                [✓] {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Diffs Preview */}
      <div className="space-y-2">
        <span className="font-mono text-tiny uppercase tracking-wider font-bold text-black block">
          MATERIAL MODIFICATIONS:
        </span>
        <div className="divide-y-2 divide-black border-2 border-black text-xs font-mono">
          {proposal.diffs.slice(0, 3).map((diff, i) => (
            <div key={i} className="p-3 bg-white">
              <span className="font-bold text-black uppercase block">{diff.label}</span>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="line-through text-gray-500 font-bold">{diff.before}</span>
                <ArrowRight size={14} strokeWidth={2} />
                <span className="font-bold text-bauhausBlue">{diff.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black font-mono">
        {isApplied ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-black bg-bauhausBlack text-white border-2 border-black shadow-hard-4">
            <Check size={16} strokeWidth={3} className="text-bauhausYellow" /> APPLIED TO ACTIVE
            PLAN
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onViewComparison}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-bold border-2 border-black bg-white text-black shadow-hard-4 btn-bauhaus hover:bg-gray-100"
            >
              VIEW COMPARISON
            </button>
            <button
              type="button"
              onClick={onApply}
              className="px-6 py-2.5 text-xs uppercase tracking-widest font-black bg-bauhausRed text-white border-2 border-black shadow-hard-4 btn-bauhaus hover:bg-bauhausRed/90"
            >
              ACCEPT & APPLY
            </button>
          </>
        )}
      </div>
    </div>
  );
}
