"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Copy,
  Trash2,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  Pencil,
  Check,
  ArrowRight,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { formatINR, rupeesToPaise } from "../../lib/budget/moneyUtils";
import { EventType } from "../../lib/types/event";

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIntake?: () => void;
}

export function EventManagerModal({
  isOpen,
  onClose,
  onNavigateToIntake,
}: EventManagerModalProps) {
  const {
    plans,
    activePlanId,
    switchEvent,
    createEvent,
    duplicateEvent,
    deleteEvent,
    updateEventName,
  } = usePlan();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // New Event Form State
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<EventType>("birthday");
  const [newCity, setNewCity] = useState("Pune");
  const [newGuestCount, setNewGuestCount] = useState(50);
  const [newBudgetRupees, setNewBudgetRupees] = useState(50000);

  if (!isOpen) return null;

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditNameText(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editNameText.trim()) {
      updateEventName(id, editNameText.trim());
    }
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createEvent(newName.trim(), newType, {
      location: { city: newCity.trim() || "Pune", venueType: "outdoor" },
      guestCount: Math.max(1, newGuestCount),
      totalBudgetMinor: rupeesToPaise(Math.max(100, newBudgetRupees)),
      theme: `${newName.trim()} Theme`,
    });

    setIsCreating(false);
    setNewName("");
    setNewBudgetRupees(50000);
    setNewGuestCount(50);
  };

  const handleCreateAndOpenIntake = (e: React.FormEvent) => {
    handleCreateSubmit(e);
    if (onNavigateToIntake) {
      onNavigateToIntake();
      onClose();
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profile.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedTypeFilter === "all" || p.profile.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-manager-title"
    >
      <div className="bg-[#F0F0F0] border-4 border-black shadow-[8px_8px_0px_0px_black] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-6 bg-[#121212] text-white flex items-center justify-between border-b-4 border-black">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#F0C020] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D02020] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#1040C0] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#F0C020] inline-block shape-triangle" />
              <span>SYSTEM ARCHIVE // MULTI-EVENT DOSSIERS</span>
            </div>
            <h2
              id="event-manager-title"
              className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight"
            >
              EVENT DOSSIER DIRECTORY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-2 border-white bg-transparent text-white hover:bg-[#D02020] hover:border-black transition-colors duration-200 btn-bauhaus"
            aria-label="Close Event Manager"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-6 border-b-4 border-black bg-white space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex-1 flex items-center gap-3">
              <input
                type="text"
                placeholder="SEARCH DOSSIERS BY NAME OR CITY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs px-3.5 py-2.5 bg-white border-2 border-black text-xs uppercase font-medium focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
              />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white border-2 border-black text-xs uppercase font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
              >
                <option value="all">ALL ARCHETYPES ({plans.length})</option>
                <option value="birthday">BIRTHDAY</option>
                <option value="wedding">WEDDING</option>
                <option value="corporate">CORPORATE</option>
                <option value="anniversary">ANNIVERSARY</option>
                <option value="community">COMMUNITY</option>
                <option value="other">OTHER</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1040C0] text-white border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus font-mono text-xs uppercase tracking-widest font-black transition-colors duration-200 hover:bg-[#1040C0]/90"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{isCreating ? "CLOSE FORM" : "INITIALIZE NEW DOSSIER"}</span>
            </button>
          </div>

          {/* Creation Form Drawer */}
          {isCreating && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-6 border-4 border-black bg-[#F0C020] shadow-[6px_6px_0px_0px_black] space-y-4 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-mono text-xs uppercase tracking-widest font-black text-black flex items-center gap-2">
                  <Sparkles size={16} strokeWidth={2.5} className="text-[#1040C0]" />
                  <span>INITIALIZE EVENT PARAMETERS</span>
                </h3>
                <span className="text-[10px] text-black font-bold uppercase tracking-wider bg-white px-2 py-0.5 border border-black">
                  DETERMINISTIC COMPOSITION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-[11px]">
                    EVENT DESIGNATION *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sangeet & Reception"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-sans font-bold text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-[11px]">
                    TYPE
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
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
                  <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-[11px]">
                    CITY
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-sans font-bold text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1.5 text-[11px]">
                    GUEST CENSUS
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={newGuestCount}
                    onChange={(e) =>
                      setNewGuestCount(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-mono font-bold text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
                <div className="w-full sm:w-auto flex items-center gap-3">
                  <label className="text-black font-black uppercase tracking-wider text-[11px]">BUDGET (₹):</label>
                  <input
                    type="number"
                    step="1000"
                    min="500"
                    value={newBudgetRupees}
                    onChange={(e) =>
                      setNewBudgetRupees(parseFloat(e.target.value) || 0)
                    }
                    className="w-36 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono font-black"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-black uppercase tracking-wider font-bold btn-bauhaus"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white hover:bg-gray-900 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black] btn-bauhaus"
                  >
                    CREATE BLANK
                  </button>
                  {onNavigateToIntake && (
                    <button
                      type="button"
                      onClick={handleCreateAndOpenIntake}
                      className="px-5 py-2 bg-[#D02020] text-white hover:bg-[#D02020]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black] btn-bauhaus flex items-center gap-1.5"
                    >
                      <Sparkles size={14} strokeWidth={2.5} />
                      <span>CREATE & INTAKE</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Event List Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#F0F0F0]">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-16 text-black font-mono font-bold uppercase tracking-widest text-xs">
              NO EVENT DOSSIERS MATCH CURRENT QUERY.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlans.map((p, idx) => {
                const isActive = p.profile.id === activePlanId;
                const completedTasks = p.tasks.filter(
                  (t) => t.status === "completed"
                ).length;
                const totalTasks = p.tasks.length;
                const taskPercent =
                  totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;

                return (
                  <div
                    key={p.profile.id}
                    className={`border-4 border-black p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
                      isActive
                        ? "bg-white shadow-[8px_8px_0px_0px_black] ring-4 ring-[#1040C0]"
                        : "bg-white shadow-[6px_6px_0px_0px_black]"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 border border-black ${idx % 3 === 0 ? 'bg-[#D02020] rounded-full' : idx % 3 === 1 ? 'bg-[#1040C0]' : 'bg-[#F0C020] shape-triangle'}`} />
                          <span className="font-mono text-[10px] uppercase tracking-widest border border-black bg-white px-2 py-0.5 text-black font-black">
                            {p.profile.type}
                          </span>
                        </div>

                        {isActive ? (
                          <span className="font-mono text-[10px] uppercase tracking-widest bg-[#1040C0] text-white px-2.5 py-0.5 font-black border border-black">
                            ACTIVE DOSSIER
                          </span>
                        ) : (
                          <button
                            onClick={() => switchEvent(p.profile.id)}
                            className="font-mono text-[11px] uppercase tracking-wider text-[#1040C0] font-bold hover:underline"
                          >
                            SELECT DOSSIER →
                          </button>
                        )}
                      </div>

                      {/* Event Title */}
                      {editingId === p.profile.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNameText}
                            onChange={(e) => setEditNameText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(p.profile.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 text-sm font-sans font-bold text-black border-2 border-black"
                          />
                          <button
                            onClick={() => handleSaveRename(p.profile.id)}
                            className="p-1.5 border-2 border-black bg-[#F0C020] hover:bg-[#F0C020]/80 btn-bauhaus"
                            title="Save title"
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
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
                              if (!isActive) switchEvent(p.profile.id);
                            }}
                            className="font-display text-xl font-black text-black uppercase tracking-tight cursor-pointer hover:text-[#1040C0] truncate"
                            title={p.profile.name}
                          >
                            {p.profile.name}
                          </h3>
                          <button
                            onClick={() =>
                              handleStartRename(p.profile.id, p.profile.name)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 border-2 border-black bg-white hover:bg-gray-100 btn-bauhaus transition-opacity duration-100"
                            title="Rename Dossier"
                          >
                            <Pencil size={12} strokeWidth={2} />
                          </button>
                        </div>
                      )}

                      {/* Key Meta row */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono border-2 border-black p-3 bg-[#F0F0F0]">
                        <div className="flex items-center gap-2 text-black font-bold">
                          <Calendar size={14} strokeWidth={2} className="text-[#1040C0]" />
                          <span>{p.profile.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-black font-bold">
                          <MapPin size={14} strokeWidth={2} className="text-[#D02020]" />
                          <span className="truncate">{p.profile.location.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-black font-bold">
                          <Users size={14} strokeWidth={2} className="text-black" />
                          <span>{p.profile.guestCount} PAX</span>
                        </div>
                        <div className="flex items-center gap-2 text-black font-black">
                          <Wallet size={14} strokeWidth={2} className="text-[#1040C0]" />
                          <span>{formatINR(p.profile.totalBudgetMinor)}</span>
                        </div>
                      </div>

                      {/* Directive Progress Bar */}
                      <div className="space-y-1.5 pt-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-black font-bold uppercase tracking-wider">
                          <span>EXECUTION DIRECTIVES</span>
                          <span className="font-black">
                            {completedTasks}/{totalTasks} ({taskPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-3 border-2 border-black bg-white p-0.5">
                          <div
                            className="h-full bg-[#1040C0] transition-all duration-200"
                            style={{ width: `${taskPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t-2 border-black flex items-center justify-between font-mono text-xs mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicateEvent(p.profile.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black] hover:bg-gray-100 btn-bauhaus"
                          title="Duplicate Dossier"
                        >
                          <Copy size={12} strokeWidth={2} />
                          <span className="text-[10px] uppercase font-bold">CLONE</span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              plans.length > 1 &&
                              confirm(
                                `Are you sure you want to delete "${p.profile.name}"?`
                              )
                            ) {
                              deleteEvent(p.profile.id);
                            }
                          }}
                          disabled={plans.length <= 1}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black] hover:bg-[#D02020] hover:text-white disabled:opacity-30 btn-bauhaus transition-colors duration-200"
                          title={
                            plans.length <= 1
                              ? "Cannot delete the sole active dossier"
                              : "Delete Dossier"
                          }
                        >
                          <Trash2 size={12} strokeWidth={2} />
                          <span className="text-[10px] uppercase font-bold">REMOVE</span>
                        </button>
                      </div>

                      {isActive ? (
                        <button
                          onClick={onClose}
                          className="flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-gray-900 border-2 border-black text-xs uppercase tracking-wider font-black shadow-[3px_3px_0px_0px_black] btn-bauhaus"
                        >
                          <span>OPEN</span>
                          <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            switchEvent(p.profile.id);
                            onClose();
                          }}
                          className="flex items-center gap-2 px-5 py-2 border-2 border-black bg-[#F0C020] text-black hover:bg-[#F0C020]/90 text-xs uppercase tracking-wider font-black shadow-[3px_3px_0px_0px_black] btn-bauhaus"
                        >
                          <span>SWITCH</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-white border-t-4 border-black flex items-center justify-between font-mono text-xs">
          <div className="uppercase tracking-widest font-bold text-black flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black inline-block" />
            <span>DOSSIER ARCHIVE: <span className="font-black">{plans.length} REGISTERED</span></span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-black bg-black text-white hover:bg-gray-900 uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black] btn-bauhaus transition-colors duration-200"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
