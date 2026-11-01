import React from "react";
import { Task } from "../../../lib/types/event";
import { NavTab } from "../../layout/Navbar";
import { DashboardTaskItem } from "../DashboardTaskItem";

interface DashboardDirectiveRegisterProps {
  upcomingTasks: Task[];
  totalTasksCount: number;
  onNavigate: (tab: NavTab) => void;
  onToggleTask: (id: string) => void;
}

/**
 * List of active event constraints and must-haves being actively enforced across planning engines.
 */
export function DashboardDirectiveRegister({
  upcomingTasks,
  totalTasksCount,
  onNavigate,
  onToggleTask,
}: DashboardDirectiveRegisterProps) {
  return (
    <section className="bg-white border-4 border-black p-8 sm:p-10 shadow-hard-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
            PRIORITY DIRECTIVE REGISTER
          </h2>
          <p className="font-mono text-xs font-bold text-black/60 uppercase">
            TOPOLOGICALLY SEQUENCED BY CRITICAL MILESTONE PROXIMITY
          </p>
        </div>
        <button
          onClick={() => onNavigate("timeline")}
          className="btn-bauhaus font-mono text-xs uppercase tracking-widest font-black px-4 py-2 bg-bauhausYellow text-black border-2 border-black shadow-hard-3 hover:bg-black hover:text-white self-start sm:self-auto transition-all"
        >
          VIEW ALL {totalTasksCount} DIRECTIVES →
        </button>
      </div>

      <div className="divide-y-2 divide-black">
        {upcomingTasks.map((task) => (
          <DashboardTaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </section>
  );
}
