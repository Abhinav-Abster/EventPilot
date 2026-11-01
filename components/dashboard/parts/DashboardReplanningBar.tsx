import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface DashboardReplanningBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  error: string | null;
  sampleScenarios: string[];
}

/**
 * Quick replanning invocation strip accessible directly from the dashboard view.
 */
export function DashboardReplanningBar({
  query,
  onQueryChange,
  onSubmit,
  isProcessing,
  error,
  sampleScenarios,
}: DashboardReplanningBarProps) {
  return (
    <section className="bg-bauhausBlue text-white border-4 border-black p-8 sm:p-10 shadow-hard-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-black text-bauhausYellow">
          <Sparkles size={18} strokeWidth={2.5} />
          <span>ADAPTIVE REPLANNING CONSTRUCT</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
          WHAT-IF ADAPTATION SOLVER
        </h2>
        <p className="text-sm font-medium text-white/90 max-w-3xl leading-relaxed">
          Instruct the deterministic solver in natural language. Trade-offs are evaluated against
          non-negotiable boundaries and visualized in a side-by-side diff matrix.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="border-4 border-black bg-bauhausRed text-white p-4 text-xs font-mono font-bold shadow-hard-4"
        >
          ERROR: {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="State disruption: e.g. 'Reduce budget to ₹30,000' or '20 more guests arrive'..."
            className="w-full px-5 py-4 bg-white border-4 border-black text-sm text-black font-bold placeholder:text-black/50 shadow-hard-4 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className="btn-bauhaus px-8 py-4 bg-bauhausYellow hover:bg-bauhausYellow/90 text-black border-4 border-black shadow-hard-4 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>SOLVING...</span>
          ) : (
            <>
              <span>SIMULATE PROPOSAL</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-white/30 text-xs font-mono">
        <span className="uppercase text-bauhausYellow text-tiny font-black tracking-wider">
          SCENARIO PRESETS:
        </span>
        {sampleScenarios.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => onQueryChange(sc)}
            className="px-3 py-1.5 border-2 border-black bg-white text-black hover:bg-bauhausYellow text-tiny font-bold uppercase tracking-wider shadow-hard-2 transition-all"
          >
            {sc}
          </button>
        ))}
      </div>
    </section>
  );
}
