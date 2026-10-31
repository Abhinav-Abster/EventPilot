"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { rupeesToPaise } from "../../lib/budget/moneyUtils";
import { DEFAULT_CITY } from "../../lib/config/constants";
import { EventToolbar } from "./parts/EventToolbar";
import { EventCreateDrawer, NewEventFormState } from "./parts/EventCreateDrawer";
import { EventDossierCard } from "./parts/EventDossierCard";

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIntake?: () => void;
}

const INITIAL_FORM: NewEventFormState = {
  name: "",
  type: "birthday",
  city: DEFAULT_CITY,
  guestCount: 50,
  budgetRupees: 50000,
};

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
  const [createForm, setCreateForm] = useState<NewEventFormState>(INITIAL_FORM);

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
    if (!createForm.name.trim()) return;

    createEvent(createForm.name.trim(), createForm.type, {
      location: { city: createForm.city.trim() || DEFAULT_CITY, venueType: "outdoor" },
      guestCount: Math.max(1, createForm.guestCount),
      totalBudgetMinor: rupeesToPaise(Math.max(100, createForm.budgetRupees)),
      theme: `${createForm.name.trim()} Theme`,
    });

    setIsCreating(false);
    setCreateForm(INITIAL_FORM);
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
          <EventToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTypeFilter={selectedTypeFilter}
            onTypeFilterChange={setSelectedTypeFilter}
            totalPlansCount={plans.length}
            isCreating={isCreating}
            onToggleCreating={() => setIsCreating(!isCreating)}
          />

          <EventCreateDrawer
            isCreating={isCreating}
            onClose={() => setIsCreating(false)}
            form={createForm}
            onChange={setCreateForm}
            onSubmit={handleCreateSubmit}
            onCreateAndIntake={onNavigateToIntake ? handleCreateAndOpenIntake : undefined}
          />
        </div>

        {/* Event List Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#F0F0F0]">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-16 text-black font-mono font-bold uppercase tracking-widest text-xs">
              NO EVENT DOSSIERS MATCH CURRENT QUERY.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlans.map((p, idx) => (
                <EventDossierCard
                  key={p.profile.id}
                  plan={p}
                  index={idx}
                  isActive={p.profile.id === activePlanId}
                  isEditing={editingId === p.profile.id}
                  editNameText={editNameText}
                  onStartRename={() => handleStartRename(p.profile.id, p.profile.name)}
                  onSaveRename={() => handleSaveRename(p.profile.id)}
                  onCancelRename={() => setEditingId(null)}
                  onEditNameChange={setEditNameText}
                  onSwitch={() => switchEvent(p.profile.id)}
                  onDuplicate={() => duplicateEvent(p.profile.id)}
                  onDelete={() => {
                    if (
                      plans.length > 1 &&
                      confirm(`Are you sure you want to delete "${p.profile.name}"?`)
                    ) {
                      deleteEvent(p.profile.id);
                    }
                  }}
                  canDelete={plans.length > 1}
                  onCloseModal={onClose}
                />
              ))}
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
