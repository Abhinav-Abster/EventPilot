import React from "react";

export interface StatusCounts {
  all: number;
  todo: number;
  overdue: number;
  blocked: number;
  completed: number;
}

interface TimelineFilterTabsProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  statusCounts: StatusCounts;
}

export function TimelineFilterTabs({
  filterStatus,
  onFilterChange,
  statusCounts,
}: TimelineFilterTabsProps) {
  const tabs = [
    { id: "all", label: `ALL (${statusCounts.all})` },
    { id: "todo", label: `PENDING (${statusCounts.todo})` },
    { id: "overdue", label: `OVERDUE (${statusCounts.overdue})` },
    { id: "blocked", label: `BLOCKED (${statusCounts.blocked})` },
    { id: "completed", label: `COMPLETED (${statusCounts.completed})` },
  ];

  return (
    <div className="space-y-3">
      <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
        DIRECTIVE FILTERS:
      </span>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
              filterStatus === f.id
                ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
                : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
