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

/**
 * Filter tab controls for isolating tasks by status (all, pending, completed, blocked).
 */
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
                ? "bg-bauhausRed text-white font-black shadow-hard-4"
                : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
