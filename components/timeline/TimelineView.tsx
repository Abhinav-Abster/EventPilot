"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { Task, TaskPriority, TaskStatus } from "../../lib/types/event";
import {
  detectCircularDependencies,
  addDaysToDate,
  formatISODate,
} from "../../lib/timeline/timelineEngine";

export function TimelineView() {
  const { plan, addTask, updateTask, deleteTask, toggleTaskStatus, updateProfile } =
    usePlan();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("general");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskRelativeDays, setNewTaskRelativeDays] = useState("-7");
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);

  // Circular dependency health check
  const cycleCheck = detectCircularDependencies(plan.tasks);

  const filteredTasks = plan.tasks.filter((task) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "todo") return task.status === "todo";
    if (filterStatus === "completed") return task.status === "completed";
    if (filterStatus === "overdue") return task.isOverdue && task.status !== "completed";
    if (filterStatus === "blocked") return task.isBlocked && task.status !== "completed";
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const relDays = parseInt(newTaskRelativeDays, 10) || 0;
    const computedDueDate = addDaysToDate(plan.profile.date, relDays);

    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription,
      category: newTaskCategory as any,
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-forest-900">
            Dependency-Aware Event Timeline
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Topologically sorted execution checklist. Completing prerequisite tasks automatically unblocks dependent downstream actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-forest-900 hover:bg-forest-850 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Cycle Detection / Warning Banner */}
      {cycleCheck.hasCycle && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold">Circular Dependency Detected in Timeline Graph!</span>
            <p>
              The following task sequence has a circular dependency loop:{" "}
              <code className="font-mono">{cycleCheck.cycleTaskIds.join(" → ")}</code>.
              Review dependencies to restore valid topological execution order.
            </p>
          </div>
        </div>
      )}

      {/* Event Date Shift Quick Tool */}
      <div className="bg-sand-50 border border-sand-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-900 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-forest-900 block">
              Event Anchor Date: {plan.profile.date}
            </span>
            <span className="text-[11px] text-stone-500">
              Shifting the event date automatically recalculates all relative task deadlines.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] text-stone-600 font-medium">Postpone by:</label>
          <button
            onClick={() => {
              const newD = addDaysToDate(plan.profile.date, 7);
              updateProfile({ date: newD });
            }}
            className="px-2.5 py-1.5 bg-white border border-sand-300 hover:border-forest-900 text-stone-800 rounded-lg text-xs font-medium transition"
          >
            +1 Week
          </button>
          <button
            onClick={() => {
              const newD = addDaysToDate(plan.profile.date, 14);
              updateProfile({ date: newD });
            }}
            className="px-2.5 py-1.5 bg-white border border-sand-300 hover:border-forest-900 text-stone-800 rounded-lg text-xs font-medium transition"
          >
            +2 Weeks
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: `All Tasks (${plan.tasks.length})` },
          {
            id: "todo",
            label: `To-Do (${plan.tasks.filter((t) => t.status === "todo").length})`,
          },
          {
            id: "overdue",
            label: `Overdue (${
              plan.tasks.filter((t) => t.isOverdue && t.status !== "completed").length
            })`,
          },
          {
            id: "blocked",
            label: `Blocked (${
              plan.tasks.filter((t) => t.isBlocked && t.status !== "completed").length
            })`,
          },
          {
            id: "completed",
            label: `Completed (${
              plan.tasks.filter((t) => t.status === "completed").length
            })`,
          },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
              filterStatus === f.id
                ? "bg-forest-900 text-white font-semibold"
                : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-sand-200 text-stone-500 text-xs">
            No tasks found matching current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            const depTasks = plan.tasks.filter((t) => (task.dependencies || []).includes(t.id));
            const unmetDeps = depTasks.filter((d) => d.status !== "completed");

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 border transition-card shadow-xs ${
                  task.isOverdue && !isDone
                    ? "border-rose-300 bg-rose-50/20"
                    : task.isBlocked && !isDone
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-sand-200 hover:border-sand-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Checkbox and Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                          : task.isBlocked
                          ? "border-amber-400 bg-amber-50 text-amber-600 cursor-not-allowed"
                          : "border-sand-400 hover:border-forest-900 bg-white"
                      }`}
                      title={
                        task.isBlocked
                          ? "Prerequisite task must be completed first"
                          : isDone
                          ? "Mark as Todo"
                          : "Mark as Completed"
                      }
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isDone ? "line-through text-stone-400" : "text-stone-900"
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            task.priority === "urgent"
                              ? "bg-rose-100 text-rose-800"
                              : task.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sand-100 text-stone-700"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Overdue Badge */}
                        {task.isOverdue && !isDone && (
                          <span className="text-[10px] font-semibold bg-rose-600 text-white px-2 py-0.5 rounded">
                            Overdue
                          </span>
                        )}

                        {/* Blocked Badge */}
                        {task.isBlocked && !isDone && (
                          <span className="text-[10px] font-semibold bg-amber-500 text-stone-950 px-2 py-0.5 rounded">
                            Blocked by Prerequisite
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Dependencies listing */}
                      {depTasks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[11px]">
                          <span className="text-stone-400 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Depends on:
                          </span>
                          {depTasks.map((dep) => (
                            <span
                              key={dep.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                dep.status === "completed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 line-through"
                                  : "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
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
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-sand-100">
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-stone-600 block">
                        Due {task.dueDate}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        {task.relativeDays === 0
                          ? "Day of Event"
                          : `${Math.abs(task.relativeDays)}d ${
                              task.relativeDays < 0 ? "prior" : "after"
                            }`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-stone-400 hover:text-forest-900 hover:bg-sand-100 rounded-lg transition"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Create Actionable Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect Pune Lawn Sound & Lighting"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements or vendor instructions..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Relative Day Offset
                  </label>
                  <input
                    type="number"
                    value={newTaskRelativeDays}
                    onChange={(e) => setNewTaskRelativeDays(e.target.value)}
                    placeholder="-7"
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    -7 = 7 days prior to event
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Prerequisite Dependencies
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
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white h-24"
                >
                  {plan.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Hold Ctrl/Cmd to select multiple dependencies
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white font-semibold rounded-lg"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Edit Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    <option value="todo">To-Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white font-semibold rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
