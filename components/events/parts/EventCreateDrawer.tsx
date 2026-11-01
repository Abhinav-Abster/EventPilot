import React from "react";
import { Sparkles } from "lucide-react";
import { EventType } from "../../../lib/types/event";

export interface NewEventFormState {
  name: string;
  type: EventType;
  city: string;
  guestCount: number;
  budgetRupees: number;
}

interface EventCreateDrawerProps {
  isCreating: boolean;
  onClose: () => void;
  form: NewEventFormState;
  onChange: (f: NewEventFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCreateAndIntake?: (e: React.FormEvent) => void;
}

/**
 * Side drawer form for entering basic parameters to initialize a new custom event plan.
 */
export function EventCreateDrawer({
  isCreating,
  onClose,
  form,
  onChange,
  onSubmit,
  onCreateAndIntake,
}: EventCreateDrawerProps) {
  if (!isCreating) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="p-6 border-4 border-black bg-bauhausYellow shadow-hard-6 space-y-4 text-xs font-mono"
    >
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <h3 className="font-mono text-xs uppercase tracking-widest font-black text-black flex items-center gap-2">
          <Sparkles size={16} strokeWidth={2.5} className="text-bauhausBlue" />
          <span>INITIALIZE EVENT PARAMETERS</span>
        </h3>
        <span className="text-micro text-black font-bold uppercase tracking-wider bg-white px-2 py-0.5 border border-black">
          DETERMINISTIC COMPOSITION
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-tiny">
            EVENT DESIGNATION *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sangeet & Reception"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-sans font-bold text-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-tiny">
            TYPE
          </label>
          <select
            value={form.type}
            onChange={(e) => onChange({ ...form, type: e.target.value as EventType })}
            className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-mono font-bold text-black focus:outline-none"
          >
            <option value="birthday">BIRTHDAY PARTY</option>
            <option value="wedding">WEDDING</option>
            <option value="corporate">CORPORATE</option>
            <option value="anniversary">ANNIVERSARY</option>
            <option value="community">COMMUNITY</option>
            <option value="other">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-tiny">
            CITY
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => onChange({ ...form, city: e.target.value })}
            className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-sans font-bold text-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-tiny">
            GUEST CENSUS
          </label>
          <input
            type="number"
            min="1"
            max="5000"
            value={form.guestCount}
            onChange={(e) => onChange({ ...form, guestCount: parseInt(e.target.value, 10) || 1 })}
            className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-mono font-bold text-black focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-black font-black uppercase tracking-wider text-tiny">
            BUDGET (₹):
          </label>
          <input
            type="number"
            step="1000"
            min="500"
            value={form.budgetRupees}
            onChange={(e) => onChange({ ...form, budgetRupees: parseFloat(e.target.value) || 0 })}
            className="w-36 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono font-black"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-black uppercase tracking-wider font-bold btn-bauhaus"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-black text-white hover:bg-gray-900 border-2 border-black uppercase tracking-widest font-black shadow-hard-3 btn-bauhaus"
          >
            CREATE BLANK
          </button>
          {onCreateAndIntake && (
            <button
              type="button"
              onClick={onCreateAndIntake}
              className="px-5 py-2 bg-bauhausRed text-white hover:bg-bauhausRed/90 border-2 border-black uppercase tracking-widest font-black shadow-hard-3 btn-bauhaus flex items-center gap-1.5"
            >
              <Sparkles size={14} strokeWidth={2.5} />
              <span>CREATE & INTAKE</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
