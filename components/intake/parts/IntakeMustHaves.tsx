import React from "react";
import { X } from "lucide-react";

interface IntakeMustHavesProps {
  mustHaves: string[];
  onAddMustHave: (val: string) => void;
  onRemoveMustHave: (index: number) => void;
}

export function IntakeMustHaves({
  mustHaves,
  onAddMustHave,
  onRemoveMustHave,
}: IntakeMustHavesProps) {
  return (
    <div className="space-y-2">
      <label className="block font-black uppercase tracking-wider text-tiny text-black">
        PROTECTED MUST-HAVES (NON-NEGOTIABLES)
      </label>
      <div className="flex flex-wrap gap-2">
        {mustHaves.map((mh, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-2 text-xs font-black bg-bauhausRed text-white px-2.5 py-1 border-2 border-black shadow-hard-2"
          >
            <span>{mh}</span>
            <button
              type="button"
              onClick={() => onRemoveMustHave(idx)}
              className="hover:text-black font-black"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder="Press Enter to register constraint..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.trim()) {
            e.preventDefault();
            onAddMustHave(e.currentTarget.value.trim());
            e.currentTarget.value = "";
          }
        }}
        className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold placeholder:text-black/50 shadow-hard-2 focus:bg-white focus:outline-none"
      />
    </div>
  );
}
