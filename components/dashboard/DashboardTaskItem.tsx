"use client";

import React from "react";
import { Check } from "lucide-react";
import { Task } from "../../lib/types/event";

export interface DashboardTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

/**
 * Compact dashboard item rendering an urgent or overdue task with quick-completion action.
 */
export const DashboardTaskItem = React.memo(function DashboardTaskItem({
  task,
  onToggle,
}: DashboardTaskItemProps) {
  const isDone = task.status === "completed";

  return (
    <div className="py-4 flex items-start sm:items-center justify-between gap-4 group hover:bg-bauhausLightYellow/40 transition-colors p-2">
      <div className="flex items-start gap-4">
        {/* Square Checkbox Button */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-6 h-6 border-2 border-black flex items-center justify-center transition-all shrink-0 ${
            isDone
              ? "bg-bauhausRed text-white shadow-hard-2"
              : "bg-white hover:bg-bauhausYellow shadow-hard-2"
          }`}
          aria-label={`Mark directive '${task.title}' as complete`}
        >
          {isDone && <Check size={16} strokeWidth={3} />}
        </button>

        <div className="space-y-1">
          <h3
            className={`text-sm sm:text-base font-black uppercase tracking-tight ${
              isDone ? "line-through text-black/40" : "text-black"
            }`}
          >
            {task.title}
          </h3>
          <p className="text-xs text-black/70 font-medium line-clamp-1">{task.description}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 font-mono text-tiny">
        <span
          className={`px-2.5 py-1 uppercase tracking-wider font-black border-2 border-black shadow-hard-2 ${
            task.priority === "urgent"
              ? "bg-bauhausRed text-white"
              : task.priority === "high"
                ? "bg-bauhausYellow text-black"
                : "bg-white text-black"
          }`}
        >
          {task.priority}
        </span>
        <span className="font-bold text-black uppercase">DUE {task.dueDate}</span>
      </div>
    </div>
  );
});
