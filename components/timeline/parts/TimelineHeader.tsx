import React from "react";
import { Plus, AlertTriangle, Calendar } from "lucide-react";
import { addDaysToDate } from "../../../lib/timeline/timelineEngine";

interface TimelineHeaderProps {
  onOpenAddModal: () => void;
  cycleCheck: { hasCycle: boolean; cycleTaskIds: string[] };
  eventDate: string;
  onUpdateEventDate: (newDate: string) => void;
}

export function TimelineHeader({
  onOpenAddModal,
  cycleCheck,
  eventDate,
  onUpdateEventDate,
}: TimelineHeaderProps) {
  return (
    <>
      {/* Editorial Bauhaus Header */}
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-3.5 h-3.5 shape-triangle bg-[#F0C020] border-b-2 border-black inline-block" />
            <span>MODULE 03 / TEMPORAL EXECUTION & DEPENDENCY TOPOLOGY</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
            TIMELINE MATRIX
          </h1>
          <p className="font-medium text-sm text-[#121212] max-w-2xl leading-relaxed">
            Topologically sequenced directive matrix. Prerequisite completions automatically unblock downstream actions across all phases.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="btn-bauhaus px-6 py-4 bg-[#1040C0] hover:bg-[#1040C0]/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>NEW DIRECTIVE</span>
        </button>
      </div>

      {/* Cycle Detection Warning Banner */}
      {cycleCheck.hasCycle && (
        <div className="border-4 border-black p-6 bg-[#D02020] text-white shadow-[8px_8px_0px_0px_black] space-y-3">
          <div className="flex items-center gap-3 border-b-2 border-white pb-2">
            <AlertTriangle size={20} strokeWidth={2.5} className="text-white shrink-0" />
            <h2 className="font-mono uppercase tracking-widest text-xs font-black text-white">
              CYCLICAL DEPENDENCY DETECTED IN TIMELINE GRAPH
            </h2>
          </div>
          <p className="font-mono text-xs font-bold text-white leading-relaxed">
            The directive sequence contains a circular dependency loop:{" "}
            <span className="underline bg-black text-[#F0C020] px-1 py-0.5">{cycleCheck.cycleTaskIds.join(" → ")}</span>.
            Topological sequence cannot resolve until cycles are eliminated.
          </p>
        </div>
      )}

      {/* Event Date Shift Quick Tool (Bauhaus Yellow) */}
      <div className="bg-[#F0C020] text-black border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black text-black">
            <Calendar size={16} strokeWidth={2.5} />
            <span>TEMPORAL ANCHOR: {eventDate}</span>
          </div>
          <p className="font-medium text-xs text-black/80">
            Modifying anchor date automatically recalibrates all dependent relative day offsets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
          <span className="font-black uppercase tracking-wider text-[11px] text-black">POSTPONE:</span>
          <button
            onClick={() => onUpdateEventDate(addDaysToDate(eventDate, 7))}
            className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-wider text-[11px] shadow-[3px_3px_0px_0px_black]"
          >
            +1 WEEK
          </button>
          <button
            onClick={() => onUpdateEventDate(addDaysToDate(eventDate, 14))}
            className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-wider text-[11px] shadow-[3px_3px_0px_0px_black]"
          >
            +2 WEEKS
          </button>
        </div>
      </div>
    </>
  );
}
