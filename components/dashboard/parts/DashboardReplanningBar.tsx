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

export function DashboardReplanningBar({
  query,
  onQueryChange,
  onSubmit,
  isProcessing,
  error,
  sampleScenarios,
}: DashboardReplanningBarProps) {
  return (
    <section className="bg-[#1040C0] text-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-black text-[#F0C020]">
          <Sparkles size={18} strokeWidth={2.5} />
          <span>ADAPTIVE REPLANNING CONSTRUCT</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
          WHAT-IF ADAPTATION SOLVER
        </h2>
        <p className="text-sm font-medium text-white/90 max-w-3xl leading-relaxed">
          Instruct the deterministic solver in natural language. Trade-offs are evaluated against non-negotiable boundaries and visualized in a side-by-side diff matrix.
        </p>
      </div>

      {error && (
        <div role="alert" className="border-4 border-black bg-[#D02020] text-white p-4 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_black]">
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
            className="w-full px-5 py-4 bg-white border-4 border-black text-sm text-black font-bold placeholder:text-black/50 shadow-[4px_4px_0px_0px_black] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className="btn-bauhaus px-8 py-4 bg-[#F0C020] hover:bg-[#F0C020]/90 text-black border-4 border-black shadow-[4px_4px_0px_0px_black] text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
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
        <span className="uppercase text-[#F0C020] text-[11px] font-black tracking-wider">
          SCENARIO PRESETS:
        </span>
        {sampleScenarios.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => onQueryChange(sc)}
            className="px-3 py-1.5 border-2 border-black bg-white text-black hover:bg-[#F0C020] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_black] transition-all"
          >
            {sc}
          </button>
        ))}
      </div>
    </section>
  );
}
