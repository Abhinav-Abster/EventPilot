"use client";

import React, { useState, useMemo, useCallback } from "react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { Task } from "../../lib/types/event";
import { detectCircularDependencies, addDaysToDate } from "../../lib/timeline/timelineEngine";
import { TimelineTaskCard } from "./TimelineTaskCard";
import { TimelineHeader } from "./parts/TimelineHeader";
import { TimelineFilterTabs } from "./parts/TimelineFilterTabs";
import { TimelineTaskAddModal, NewTaskFormData } from "./parts/TimelineTaskAddModal";
import { TimelineTaskEditModal } from "./parts/TimelineTaskEditModal";

const INITIAL_TASK_FORM: NewTaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  relativeDays: "-7",
  dependencies: [],
};

export function TimelineView() {
  const { plan, addTask, updateTask, deleteTask, toggleTaskStatus, updateProfile } = usePlan();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<NewTaskFormData>(INITIAL_TASK_FORM);

  const cycleCheck = useMemo(() => detectCircularDependencies(plan.tasks), [plan.tasks]);

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
    return { all: plan.tasks.length, todo, overdue, blocked, completed };
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

  const taskById = useMemo(() => new Map(plan.tasks.map((t) => [t.id, t])), [plan.tasks]);

  const handleToggleTask = useCallback((id: string) => toggleTaskStatus(id), [toggleTaskStatus]);
  const handleEditTask = useCallback((task: Task) => setEditingTask(task), []);
  const handleDeleteTask = useCallback((id: string) => deleteTask(id), [deleteTask]);
  const handleUpdateEventDate = useCallback(
    (newDate: string) => updateProfile({ date: newDate }),
    [updateProfile]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const relDays = parseInt(taskForm.relativeDays, 10) || 0;
    const computedDueDate = addDaysToDate(plan.profile.date, relDays);

    addTask({
      title: taskForm.title.trim(),
      description: taskForm.description,
      category: "general",
      priority: taskForm.priority,
      relativeDays: relDays,
      dueDate: computedDueDate,
      status: "todo",
      dependencies: taskForm.dependencies,
      isOverdue: false,
      isBlocked: false,
    });

    setShowAddModal(false);
    setTaskForm(INITIAL_TASK_FORM);
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

  return (
    <div className="space-y-12 pb-12">
      <TimelineHeader
        onOpenAddModal={() => setShowAddModal(true)}
        cycleCheck={cycleCheck}
        eventDate={plan.profile.date}
        onUpdateEventDate={handleUpdateEventDate}
      />

      <TimelineFilterTabs
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        statusCounts={statusCounts}
      />

      <div className="w-full border-t-4 border-black" />

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center text-xs font-mono uppercase tracking-widest font-black text-black/60 shadow-hard-6">
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

      <TimelineTaskAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={taskForm}
        onChange={setTaskForm}
        onSubmit={handleCreateTask}
        availableTasks={plan.tasks}
      />

      <TimelineTaskEditModal
        editingTask={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleSaveEdit}
        onChange={setEditingTask}
      />
    </div>
  );
}
