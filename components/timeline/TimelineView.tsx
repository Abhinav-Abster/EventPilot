"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { Task, TaskPriority, TaskStatus, TaskCategory } from "../../lib/types/event";
import {
  detectCircularDependencies,
  addDaysToDate,
} from "../../lib/timeline/timelineEngine";
import { TimelineTaskCard } from "./TimelineTaskCard";

export function TimelineView() {
  const { plan, addTask, updateTask, deleteTask, toggleTaskStatus, updateProfile } =
    usePlan();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>("general");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskRelativeDays, setNewTaskRelativeDays] = useState("-7");
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);

  // Circular dependency health check
  const cycleCheck = useMemo(
    () => detectCircularDependencies(plan.tasks),
    [plan.tasks]
  );

  const statusCounts = useMemo(() => {
    let todo = 0;
    let overdue = 0;
    let blocked = 0;
    let completed = 0;

    for (const t of plan.tasks) {
      if (t.status === "completed") {
        completed++;
      } else {
        if (t.status === "todo") todo++;
        if (t.isOverdue) overdue++;
        if (t.isBlocked) blocked++;
      }
    }

    return {
      all: plan.tasks.length,
      todo,
      overdue,
      blocked,
      completed,
    };
  }, [plan.tasks]);

  const filteredTasks = useMemo(() => {
    return plan.tasks.filter((task) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "todo") return task.status === "todo";
      if (filterStatus === "completed") return task.status === "completed";
      if (filterStatus === "overdue") return task.isOverdue && task.status !== "completed";
      if (filterStatus === "blocked") return task.isBlocked && task.status !== "completed";
      return true;
    });
  }, [plan.tasks, filterStatus]);

  const taskById = useMemo(
    () => new Map(plan.tasks.map((t) => [t.id, t])),
    [plan.tasks]
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      toggleTaskStatus(id);
    },
    [toggleTaskStatus]
  );

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTask(id);
    },
    [deleteTask]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const relDays = parseInt(newTaskRelativeDays, 10) || 0;
    const computedDueDate = addDaysToDate(plan.profile.date, relDays);

    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription,
      category: newTaskCategory,
      priority: newTaskPriority,
      relativeDays: relDays,
      dueDate: computedDueDate,
      status: "todo",
      dependencies: newTaskDependencies,
      isOverdue: false,
      isBlocked: false,
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
      status: editingTask.status,
      dependencies: editingTask.dependencies,
    });

    setEditingTask(null);
  };

  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskCategory("general");
    setNewTaskPriority("medium");
    setNewTaskRelativeDays("-7");
    setNewTaskDependencies([]);
  };

  return (
    <div className="space-y-12 pb-12">
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
          onClick={() => setShowAddModal(true)}
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
            <span>TEMPORAL ANCHOR: {plan.profile.date}</span>
          </div>
          <p className="font-medium text-xs text-black/80">
            Modifying anchor date automatically recalibrates all dependent relative day offsets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
          <span className="font-black uppercase tracking-wider text-[11px] text-black">POSTPONE:</span>
          <button
            onClick={() => {
              const newD = addDaysToDate(plan.profile.date, 7);
              updateProfile({ date: newD });
            }}
            className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-wider text-[11px] shadow-[3px_3px_0px_0px_black]"
          >
            +1 WEEK
          </button>
          <button
            onClick={() => {
              const newD = addDaysToDate(plan.profile.date, 14);
              updateProfile({ date: newD });
            }}
            className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-wider text-[11px] shadow-[3px_3px_0px_0px_black]"
          >
            +2 WEEKS
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
          DIRECTIVE FILTERS:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `ALL (${statusCounts.all})` },
            {
              id: "todo",
              label: `PENDING (${statusCounts.todo})`,
            },
            {
              id: "overdue",
              label: `OVERDUE (${statusCounts.overdue})`,
            },
            {
              id: "blocked",
              label: `BLOCKED (${statusCounts.blocked})`,
            },
            {
              id: "completed",
              label: `COMPLETED (${statusCounts.completed})`,
            },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
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

      {/* 4px Heavy Divider */}
      <div className="w-full border-t-4 border-black" />

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center text-xs font-mono uppercase tracking-widest font-black text-black/60 shadow-[6px_6px_0px_0px_black]">
            NO DIRECTIVES MATCHING ACTIVE FILTER.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const depTasks = (task.dependencies || [])
              .map((id) => taskById.get(id))
              .filter((t): t is Task => Boolean(t));

            return (
              <TimelineTaskCard
                key={task.id}
                task={task}
                depTasks={depTasks}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#1040C0] text-white border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
                CREATE DIRECTIVE
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 border-2 border-white bg-white text-black hover:bg-[#D02020] hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  DIRECTIVE TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect Pune Lawn Sound & Lighting"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  OPERATIONAL DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  placeholder="Vendor instructions or milestone criteria..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    PRIORITY
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    <option value="urgent">URGENT</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    RELATIVE DAYS OFFSET
                  </label>
                  <input
                    type="number"
                    value={newTaskRelativeDays}
                    onChange={(e) => setNewTaskRelativeDays(e.target.value)}
                    placeholder="-7"
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                  <span className="text-[10px] text-black/60 font-bold block mt-0.5">
                    -7 = 7 DAYS BEFORE EVENT
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  PREREQUISITE DIRECTIVES
                </label>
                <select
                  multiple
                  value={newTaskDependencies}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setNewTaskDependencies(selected);
                  }}
                  className="w-full p-2 border-2 border-black text-xs font-mono text-black bg-[#F0F0F0] h-24 shadow-[2px_2px_0px_0px_black]"
                >
                  {plan.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-black/60 font-bold block mt-0.5">
                  Hold Ctrl/Cmd to select multiple dependencies
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-bauhaus px-6 py-2 bg-[#1040C0] text-white hover:bg-[#1040C0]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
                >
                  REGISTER DIRECTIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#F0C020] text-black border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
                EDIT DIRECTIVE
              </h2>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  TITLE
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    PRIORITY
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    <option value="urgent">URGENT</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    STATUS
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    <option value="todo">PENDING</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="completed">COMPLETED</option>
                    <option value="blocked">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-bauhaus px-6 py-2 bg-[#F0C020] text-black hover:bg-[#F0C020]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
                >
                  COMMIT DIRECTIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
