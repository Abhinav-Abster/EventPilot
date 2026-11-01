import React from "react";
import { X } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "../../../lib/types/event";

interface TimelineTaskEditModalProps {
  editingTask: Task | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (t: Task) => void;
}

export function TimelineTaskEditModal({
  editingTask,
  onClose,
  onSubmit,
  onChange,
}: TimelineTaskEditModalProps) {
  if (!editingTask) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-black max-w-md w-full shadow-hard-8 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-bauhausYellow text-black border-b-4 border-black">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
            EDIT DIRECTIVE
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-bauhausRed hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              TITLE
            </label>
            <input
              type="text"
              required
              value={editingTask.title}
              onChange={(e) => onChange({ ...editingTask, title: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
              DESCRIPTION
            </label>
            <textarea
              rows={2}
              value={editingTask.description}
              onChange={(e) => onChange({ ...editingTask, description: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                PRIORITY
              </label>
              <select
                value={editingTask.priority}
                onChange={(e) =>
                  onChange({ ...editingTask, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
              >
                <option value="urgent">URGENT</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-tiny">
                STATUS
              </label>
              <select
                value={editingTask.status}
                onChange={(e) => onChange({ ...editingTask, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
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
              onClick={onClose}
              className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-bauhausCanvas text-black uppercase tracking-wider font-bold shadow-hard-2"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-bauhaus px-6 py-2 bg-bauhausYellow text-black hover:bg-bauhausYellow/90 border-2 border-black uppercase tracking-widest font-black shadow-hard-3"
            >
              COMMIT DIRECTIVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
