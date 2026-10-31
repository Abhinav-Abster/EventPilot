import React from "react";
import { X } from "lucide-react";
import { Task, TaskPriority } from "../../../lib/types/event";

export interface NewTaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  relativeDays: string;
  dependencies: string[];
}

interface TimelineTaskAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: NewTaskFormData;
  onChange: (f: NewTaskFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  availableTasks: Task[];
}

export function TimelineTaskAddModal({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  availableTasks,
}: TimelineTaskAddModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="p-1 border-2 border-white bg-white text-black hover:bg-[#D02020] hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
              DIRECTIVE TITLE
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inspect Pune Lawn Sound & Lighting"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
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
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                PRIORITY
              </label>
              <select
                value={form.priority}
                onChange={(e) => onChange({ ...form, priority: e.target.value as TaskPriority })}
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
                value={form.relativeDays}
                onChange={(e) => onChange({ ...form, relativeDays: e.target.value })}
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
              value={form.dependencies}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                onChange({ ...form, dependencies: selected });
              }}
              className="w-full p-2 border-2 border-black text-xs font-mono text-black bg-[#F0F0F0] h-24 shadow-[2px_2px_0px_0px_black]"
            >
              {availableTasks.map((t) => (
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
              onClick={onClose}
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
  );
}
