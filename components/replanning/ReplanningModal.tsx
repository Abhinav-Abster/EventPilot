"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-sand-300 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-850 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-400" />
              Adaptive Replanning Proposal
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full">
              <span>Feasibility:</span>
              <span
                className={
                  activeProposal.impact.feasibilityScore >= 85
                    ? "text-emerald-300 font-bold"
                    : "text-amber-300 font-bold"
                }
              >
                {activeProposal.impact.feasibilityScore}%
              </span>
            </div>
          </div>
          <h2 id="proposal-title" className="text-xl font-bold font-display text-white">
            {activeProposal.title}
          </h2>
          <p className="text-xs text-sand-200 mt-1 leading-relaxed">
            {activeProposal.summary}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Key Impact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-sand-50 border border-sand-200 rounded-xl">
              <div className="text-[11px] font-medium text-stone-500 mb-0.5 flex items-center gap-1">
                {isSavings ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Budget Impact</span>
              </div>
              <div
                className={`text-base font-bold ${
                  isSavings ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {isSavings ? `-${formatINR(absDelta)}` : `+${formatINR(absDelta)}`}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isSavings ? "Savings achieved" : "Additional expense"}
              </p>
            </div>

            <div className="p-3 bg-sand-50 border border-sand-200 rounded-xl">
              <div className="text-[11px] font-medium text-stone-500 mb-0.5">
                New Total Estimated
              </div>
              <div className="text-base font-bold text-forest-900">
                {formatINR(activeProposal.impact.newTotalEstimatedMinor)}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Matches budget target
              </p>
            </div>

            <div className="p-3 bg-sand-50 border border-sand-200 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-[11px] font-medium text-stone-500 mb-0.5">
                Tasks & Vendors
              </div>
              <div className="text-base font-bold text-stone-800">
                {activeProposal.impact.tasksAffectedCount} Updated
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Schedule synchronized
              </p>
            </div>
          </div>

          {/* Preserved Protected Constraints */}
          {activeProposal.impact.preservedConstraints.length > 0 && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Protected Non-Negotiable Requirements Preserved</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeProposal.impact.preservedConstraints.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unresolved Conflicts / Warnings */}
          {activeProposal.impact.unresolvedIssues.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Items Requiring User Attention</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                {activeProposal.impact.unresolvedIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-Side Diff Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              Material Plan Changes & Trade-offs
            </h4>
            <div className="border border-sand-200 rounded-xl overflow-hidden divide-y divide-sand-200 text-xs">
              {activeProposal.diffs.map((diff, idx) => (
                <div key={idx} className="p-3 hover:bg-sand-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-900">{diff.label}</span>
                    <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-sand-200 text-stone-700">
                      {diff.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] mb-1">
                    <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 line-through">
                      {diff.before}
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                      {diff.after}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    {diff.impactReason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-sand-50 border-t border-sand-200 p-4 flex items-center justify-between gap-3">
          <button
            onClick={rejectProposal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-sand-200/60 rounded-xl transition"
          >
            <XCircle className="w-4 h-4 text-stone-500" />
            <span>Reject Proposal (Keep Current Plan)</span>
          </button>

          <button
            onClick={() => applyProposal(activeProposal)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-forest-900 hover:bg-forest-850 text-white rounded-xl shadow-md transition"
          >
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Accept & Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
