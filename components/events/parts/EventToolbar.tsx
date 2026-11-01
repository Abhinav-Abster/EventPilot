import React from "react";
import { Plus } from "lucide-react";

interface EventToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTypeFilter: string;
  onTypeFilterChange: (t: string) => void;
  totalPlansCount: number;
  isCreating: boolean;
  onToggleCreating: () => void;
}

export function EventToolbar({
  searchQuery,
  onSearchChange,
  selectedTypeFilter,
  onTypeFilterChange,
  totalPlansCount,
  isCreating,
  onToggleCreating,
}: EventToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
      <div className="flex-1 flex items-center gap-3">
        <input
          type="text"
          placeholder="SEARCH DOSSIERS BY NAME OR CITY..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-xs px-3.5 py-2.5 bg-white border-2 border-black text-xs uppercase font-medium focus:outline-none focus:ring-2 focus:ring-bauhausBlue"
        />
        <select
          value={selectedTypeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3.5 py-2.5 bg-white border-2 border-black text-xs uppercase font-bold text-black focus:outline-none focus:ring-2 focus:ring-bauhausBlue"
        >
          <option value="all">ALL ARCHETYPES ({totalPlansCount})</option>
          <option value="birthday">BIRTHDAY</option>
          <option value="wedding">WEDDING</option>
          <option value="corporate">CORPORATE</option>
          <option value="anniversary">ANNIVERSARY</option>
          <option value="community">COMMUNITY</option>
          <option value="other">OTHER</option>
        </select>
      </div>

      <button
        onClick={onToggleCreating}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-bauhausBlue text-white border-2 border-black shadow-hard-4 btn-bauhaus font-mono text-xs uppercase tracking-widest font-black transition-colors duration-200 hover:bg-bauhausBlue/90"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>{isCreating ? "CLOSE FORM" : "INITIALIZE NEW DOSSIER"}</span>
      </button>
    </div>
  );
}
