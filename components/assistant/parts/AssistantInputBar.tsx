import React from "react";
import { Sparkles } from "lucide-react";

interface AssistantInputBarProps {
  inputQuery: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEvaluating: boolean;
}

export function AssistantInputBar({
  inputQuery,
  onInputChange,
  onSubmit,
  isEvaluating,
}: AssistantInputBarProps) {
  return (
    <div className="p-4 border-t-4 border-black bg-white">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Hypothetical disruption (e.g. 'Budget is now ₹30,000' or 'Move party indoors')..."
          className="flex-1 px-4 py-3 bg-white border-2 border-black text-xs sm:text-sm font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isEvaluating}
          className="px-6 py-3 bg-[#1040C0] text-white border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-40 flex items-center gap-2 shrink-0 hover:bg-[#1040C0]/90"
        >
          <Sparkles size={16} strokeWidth={2} />
          <span>SOLVE</span>
        </button>
      </form>
    </div>
  );
}
