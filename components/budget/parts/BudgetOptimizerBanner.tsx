import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface BudgetOptimizerBannerProps {
  targetOptimizationRupees: string;
  setTargetOptimizationRupees: (val: string) => void;
  onSimulate: () => void;
}

export function BudgetOptimizerBanner({
  targetOptimizationRupees,
  setTargetOptimizationRupees,
  onSimulate,
}: BudgetOptimizerBannerProps) {
  return (
    <div className="bg-bauhausYellow text-black border-4 border-black p-8 shadow-hard-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2 max-w-xl">
        <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-widest font-black text-black">
          <Sparkles size={16} strokeWidth={2.5} />
          <span>ALGORITHMIC SPEND OPTIMIZER</span>
        </div>
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
          DETERMINISTIC REDUCTION SOLVER
        </h2>
        <p className="text-sm font-medium text-black/90 leading-relaxed">
          Specify a target cap to simulate structured reductions. The deterministic engine protects
          non-negotiable items (e.g. pure vegetarian catering, core themes) while scaling flexible
          allocations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-auto">
          <span className="absolute left-3 top-3 text-black font-mono text-xs font-black">₹</span>
          <input
            type="number"
            step="1000"
            value={targetOptimizationRupees}
            onChange={(e) => setTargetOptimizationRupees(e.target.value)}
            className="pl-8 pr-4 py-3 w-full sm:w-36 bg-white border-4 border-black text-xs font-mono font-black text-black shadow-hard-3 focus:outline-none"
            placeholder="30000"
          />
        </div>
        <button
          onClick={onSimulate}
          className="btn-bauhaus w-full sm:w-auto px-6 py-3.5 bg-bauhausBlue hover:bg-bauhausBlue/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-hard-4 shrink-0 flex items-center justify-center gap-2"
        >
          <span>SIMULATE CUTS</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
