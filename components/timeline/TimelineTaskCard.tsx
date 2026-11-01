"use client";

import React from "react";
import { Check, Link as LinkIcon, Edit2, Trash2 } from "lucide-react";
import { Task } from "../../lib/types/event";

export interface TimelineTaskCardProps {
  task: Task;
  depTasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TimelineTaskCard = React.memo(function TimelineTaskCard({
  task,
  depTasks,
  onToggle,
  onEdit,
  onDelete,
}: TimelineTaskCardProps) {
  const isDone = task.status === "completed";

  return (
    <div
      className={`card-bauhaus border-4 border-black p-6 shadow-hard-6 transition-all ${
        isDone
          ? "bg-bauhausCanvas opacity-80"
          : task.isOverdue
            ? "bg-bauhausLightYellow"
            : "bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Square Checkbox & Info */}
        <div className="flex items-start gap-4 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className={`mt-1 w-6 h-6 border-2 border-black flex items-center justify-center transition-all shrink-0 ${
              isDone
                ? "bg-bauhausRed text-white shadow-hard-2"
                : task.isBlocked
                  ? "bg-bauhausMuted text-black cursor-not-allowed border-dashed"
                  : "bg-white hover:bg-bauhausYellow shadow-hard-2"
            }`}
            title={
              task.isBlocked
                ? "Prerequisite directive must be resolved first"
                : isDone
                  ? "Mark as Pending"
                  : "Mark as Complete"
            }
          >
            {isDone && <Check size={16} strokeWidth={3} />}
          </button>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`font-display font-black text-base uppercase tracking-tight ${
                  isDone ? "line-through text-black/40" : "text-black"
                }`}
              >
                {task.title}
              </h2>

              {/* Priority Badge */}
              <span
                className={`text-micro font-mono uppercase px-2 py-0.5 border-2 border-black font-black shadow-hard-2 ${
                  task.priority === "urgent"
                    ? "bg-bauhausRed text-white"
                    : task.priority === "high"
                      ? "bg-bauhausYellow text-black"
                      : "bg-white text-black"
                }`}
              >
                {task.priority}
              </span>

              {/* Overdue Badge */}
              {task.isOverdue && !isDone && (
                <span className="text-micro font-mono uppercase bg-bauhausRed text-white px-2 py-0.5 font-black border-2 border-black shadow-hard-2">
                  OVERDUE
                </span>
              )}

              {/* Blocked Badge */}
              {task.isBlocked && !isDone && (
                <span className="text-micro font-mono uppercase bg-bauhausBlue text-white px-2 py-0.5 font-black border-2 border-black shadow-hard-2">
                  BLOCKED BY PREREQUISITE
                </span>
              )}
            </div>

            <p className="font-medium text-xs text-black/80 leading-relaxed">{task.description}</p>

            {/* Dependencies listing */}
            {depTasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-tiny font-mono">
                <span className="text-black/70 flex items-center gap-1 uppercase tracking-wider text-micro font-black">
                  <LinkIcon size={12} strokeWidth={2} /> REQUIRES:
                </span>
                {depTasks.map((dep) => (
                  <span
                    key={dep.id}
                    className={`px-2 py-0.5 text-micro uppercase tracking-wider border-2 border-black font-bold shadow-hard-2 ${
                      dep.status === "completed"
                        ? "bg-bauhausMuted text-black/50 line-through"
                        : "bg-bauhausYellow text-black font-black"
                    }`}
                  >
                    {dep.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right metadata & actions */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-black font-mono">
          <div className="text-right">
            <span className="text-xs font-black text-black block">DUE {task.dueDate}</span>
            <span className="text-micro font-bold text-black/70 uppercase tracking-wider block">
              {task.relativeDays === 0
                ? "EVENT DAY"
                : `${Math.abs(task.relativeDays)}D ${task.relativeDays < 0 ? "PRIOR" : "POST"}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 border-2 border-black bg-white hover:bg-bauhausYellow text-black shadow-hard-2 transition-all"
              title="Edit Directive"
            >
              <Edit2 size={13} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 border-2 border-black bg-white hover:bg-bauhausRed hover:text-white text-black shadow-hard-2 transition-all"
              title="Delete Directive"
            >
              <Trash2 size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
