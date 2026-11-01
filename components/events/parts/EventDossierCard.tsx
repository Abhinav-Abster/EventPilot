import React from "react";
import {
  Calendar,
  Users,
  Wallet,
  MapPin,
  Pencil,
  Check,
  X,
  Copy,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { EventPlan } from "../../../lib/types/event";
import { formatINR } from "../../../lib/budget/moneyUtils";

interface EventDossierCardProps {
  plan: EventPlan;
  index: number;
  isActive: boolean;
  isEditing: boolean;
  editNameText: string;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onEditNameChange: (text: string) => void;
  onSwitch: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onCloseModal: () => void;
}

export function EventDossierCard({
  plan,
  index,
  isActive,
  isEditing,
  editNameText,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditNameChange,
  onSwitch,
  onDuplicate,
  onDelete,
  canDelete,
  onCloseModal,
}: EventDossierCardProps) {
  const completedTasks = plan.tasks.filter((t) => t.status === "completed").length;
  const totalTasks = plan.tasks.length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      className={`border-4 border-black p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
        isActive ? "bg-white shadow-hard-8 ring-4 ring-bauhausBlue" : "bg-white shadow-hard-6"
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 border border-black ${
                index % 3 === 0
                  ? "bg-bauhausRed rounded-full"
                  : index % 3 === 1
                    ? "bg-bauhausBlue"
                    : "bg-bauhausYellow shape-triangle"
              }`}
            />
            <span className="font-mono text-micro uppercase tracking-widest border border-black bg-white px-2 py-0.5 text-black font-black">
              {plan.profile.type}
            </span>
          </div>

          {isActive ? (
            <span className="font-mono text-micro uppercase tracking-widest bg-bauhausBlue text-white px-2.5 py-0.5 font-black border border-black">
              ACTIVE DOSSIER
            </span>
          ) : (
            <button
              onClick={onSwitch}
              className="font-mono text-tiny uppercase tracking-wider text-bauhausBlue font-bold hover:underline"
            >
              SELECT DOSSIER →
            </button>
          )}
        </div>

        {/* Event Title */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editNameText}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveRename();
                if (e.key === "Escape") onCancelRename();
              }}
              autoFocus
              className="flex-1 px-3 py-1.5 text-sm font-sans font-bold text-black border-2 border-black"
            />
            <button
              onClick={onSaveRename}
              className="p-1.5 border-2 border-black bg-bauhausYellow hover:bg-bauhausYellow/80 btn-bauhaus"
              title="Save title"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={onCancelRename}
              className="p-1.5 border-2 border-black bg-white hover:bg-gray-100 btn-bauhaus"
              title="Cancel"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 group">
            <h3
              onClick={() => {
                if (!isActive) onSwitch();
              }}
              className="font-display text-xl font-black text-black uppercase tracking-tight cursor-pointer hover:text-bauhausBlue truncate"
              title={plan.profile.name}
            >
              {plan.profile.name}
            </h3>
            <button
              onClick={onStartRename}
              className="opacity-0 group-hover:opacity-100 p-1 border-2 border-black bg-white hover:bg-gray-100 btn-bauhaus transition-opacity duration-100"
              title="Rename Dossier"
            >
              <Pencil size={12} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Key Meta row */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono border-2 border-black p-3 bg-bauhausCanvas">
          <div className="flex items-center gap-2 text-black font-bold">
            <Calendar size={14} strokeWidth={2} className="text-bauhausBlue" />
            <span>{plan.profile.date}</span>
          </div>
          <div className="flex items-center gap-2 text-black font-bold">
            <MapPin size={14} strokeWidth={2} className="text-bauhausRed" />
            <span className="truncate">{plan.profile.location.city}</span>
          </div>
          <div className="flex items-center gap-2 text-black font-bold">
            <Users size={14} strokeWidth={2} className="text-black" />
            <span>{plan.profile.guestCount} PAX</span>
          </div>
          <div className="flex items-center gap-2 text-black font-black">
            <Wallet size={14} strokeWidth={2} className="text-bauhausBlue" />
            <span>{formatINR(plan.profile.totalBudgetMinor)}</span>
          </div>
        </div>

        {/* Directive Progress Bar */}
        <div className="space-y-1.5 pt-1 font-mono text-micro">
          <div className="flex items-center justify-between text-black font-bold uppercase tracking-wider">
            <span>EXECUTION DIRECTIVES</span>
            <span className="font-black">
              {completedTasks}/{totalTasks} ({taskPercent}%)
            </span>
          </div>
          <div className="w-full h-3 border-2 border-black bg-white p-0.5">
            <div
              className="h-full bg-bauhausBlue transition-all duration-200"
              style={{ width: `${taskPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t-2 border-black flex items-center justify-between font-mono text-xs mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onDuplicate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black bg-white shadow-hard-2 hover:bg-gray-100 btn-bauhaus"
            title="Duplicate Dossier"
          >
            <Copy size={12} strokeWidth={2} />
            <span className="text-micro uppercase font-bold">CLONE</span>
          </button>
          <button
            onClick={onDelete}
            disabled={!canDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black bg-white shadow-hard-2 hover:bg-bauhausRed hover:text-white disabled:opacity-30 btn-bauhaus transition-colors duration-200"
            title={canDelete ? "Delete Dossier" : "Cannot delete the sole active dossier"}
          >
            <Trash2 size={12} strokeWidth={2} />
            <span className="text-micro uppercase font-bold">REMOVE</span>
          </button>
        </div>

        {isActive ? (
          <button
            onClick={onCloseModal}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-gray-900 border-2 border-black text-xs uppercase tracking-wider font-black shadow-hard-3 btn-bauhaus"
          >
            <span>OPEN</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={() => {
              onSwitch();
              onCloseModal();
            }}
            className="flex items-center gap-2 px-5 py-2 border-2 border-black bg-bauhausYellow text-black hover:bg-bauhausYellow/90 text-xs uppercase tracking-wider font-black shadow-hard-3 btn-bauhaus"
          >
            <span>SWITCH</span>
          </button>
        )}
      </div>
    </div>
  );
}
