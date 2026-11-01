import React from "react";
import { Calendar, Users, Wallet, MapPin, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { EventProfile, DietaryPreference, VenueType } from "../../../lib/types/event";
import { paiseToRupees, rupeesToPaise } from "../../../lib/budget/moneyUtils";
import { DEFAULT_CITY } from "../../../lib/config/constants";
import { IntakeMustHaves } from "./IntakeMustHaves";

interface IntakeProfileFormProps {
  stagedProfile: Partial<EventProfile>;
  onUpdateProfile: (p: Partial<EventProfile>) => void;
  saveAsNewEvent: boolean;
  setSaveAsNewEvent: (val: boolean) => void;
  isGeneratingPlan: boolean;
  onGeneratePlan: () => void;
}

/**
 * Structured fallback form for directly configuring event dates, locations, guests, and budgets.
 */
export function IntakeProfileForm({
  stagedProfile,
  onUpdateProfile,
  saveAsNewEvent,
  setSaveAsNewEvent,
  isGeneratingPlan,
  onGeneratePlan,
}: IntakeProfileFormProps) {
  const handleAddMustHave = (val: string) => {
    onUpdateProfile({
      ...stagedProfile,
      mustHaves: [...(stagedProfile.mustHaves || []), val],
    });
  };

  const handleRemoveMustHave = (index: number) => {
    onUpdateProfile({
      ...stagedProfile,
      mustHaves: stagedProfile.mustHaves?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="lg:col-span-5 border-4 border-black bg-white shadow-hard-8 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-4 border-black bg-bauhausYellow -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 text-black">
        <div>
          <h2 className="font-display font-black text-lg uppercase tracking-tight">
            STRUCTURED SPECIFICATION
          </h2>
          <p className="font-mono text-tiny font-bold uppercase">VALIDATED SCHEMA PROFILES</p>
        </div>
        <span className="font-mono text-micro uppercase font-black bg-black text-white px-2.5 py-1 border border-black shadow-hard-2">
          SYNCHRONIZED
        </span>
      </div>

      <div className="space-y-4 text-xs font-mono">
        <div>
          <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black">
            EVENT DESIGNATION / NAME
          </label>
          <input
            type="text"
            value={stagedProfile.name || ""}
            onChange={(e) => onUpdateProfile({ ...stagedProfile, name: e.target.value })}
            className="w-full px-3 py-2.5 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black flex items-center gap-1">
              <Calendar size={13} strokeWidth={2.5} />
              <span>DATE</span>
            </label>
            <input
              type="date"
              value={stagedProfile.date || ""}
              onChange={(e) => onUpdateProfile({ ...stagedProfile, date: e.target.value })}
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black flex items-center gap-1">
              <Users size={13} strokeWidth={2.5} />
              <span>GUEST CENSUS</span>
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={stagedProfile.guestCount || 60}
              onChange={(e) =>
                onUpdateProfile({
                  ...stagedProfile,
                  guestCount: parseInt(e.target.value, 10) || 1,
                })
              }
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black flex items-center gap-1">
              <Wallet size={13} strokeWidth={2.5} />
              <span>BUDGET LIMIT (₹)</span>
            </label>
            <input
              type="number"
              step="500"
              value={
                stagedProfile.totalBudgetMinor
                  ? paiseToRupees(stagedProfile.totalBudgetMinor)
                  : 40000
              }
              onChange={(e) =>
                onUpdateProfile({
                  ...stagedProfile,
                  totalBudgetMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                })
              }
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black flex items-center gap-1">
              <MapPin size={13} strokeWidth={2.5} />
              <span>CITY LOCATION</span>
            </label>
            <input
              type="text"
              value={stagedProfile.location?.city || DEFAULT_CITY}
              onChange={(e) =>
                onUpdateProfile({
                  ...stagedProfile,
                  location: {
                    ...(stagedProfile.location || { venueType: "outdoor" }),
                    city: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black">
              VENUE SETTING
            </label>
            <select
              value={stagedProfile.location?.venueType || "outdoor"}
              onChange={(e) =>
                onUpdateProfile({
                  ...stagedProfile,
                  location: {
                    ...(stagedProfile.location || { city: DEFAULT_CITY }),
                    venueType: e.target.value as VenueType,
                  },
                })
              }
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            >
              <option value="outdoor">OUTDOOR LAWN</option>
              <option value="indoor">INDOOR HALL</option>
              <option value="hybrid">HYBRID</option>
            </select>
          </div>
          <div>
            <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black">
              DIETARY MANDATE
            </label>
            <select
              value={stagedProfile.dietaryPreferences?.[0] || "vegetarian"}
              onChange={(e) =>
                onUpdateProfile({
                  ...stagedProfile,
                  dietaryPreferences: [e.target.value as DietaryPreference],
                })
              }
              className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
            >
              <option value="vegetarian">100% VEGETARIAN</option>
              <option value="non-vegetarian">NON-VEGETARIAN</option>
              <option value="jain">JAIN VEGETARIAN</option>
              <option value="vegan">VEGAN</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-black uppercase tracking-wider mb-1 text-tiny text-black">
            AESTHETIC / THEME DIRECTIVE
          </label>
          <input
            type="text"
            value={stagedProfile.theme || ""}
            onChange={(e) => onUpdateProfile({ ...stagedProfile, theme: e.target.value })}
            className="w-full px-3 py-2 bg-bauhausCanvas border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-hard-2"
          />
        </div>

        <IntakeMustHaves
          mustHaves={stagedProfile.mustHaves || []}
          onAddMustHave={handleAddMustHave}
          onRemoveMustHave={handleRemoveMustHave}
        />
      </div>

      <div className="pt-4 border-t-4 border-black space-y-4">
        <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsNewEvent}
            onChange={(e) => setSaveAsNewEvent(e.target.checked)}
            className="w-4 h-4 border-2 border-black accent-bauhausRed"
          />
          <span>SAVE AS NEW EVENT (PRESERVE CURRENT DOSSIER)</span>
        </label>

        <button
          onClick={onGeneratePlan}
          disabled={isGeneratingPlan}
          className="btn-bauhaus w-full py-4 bg-bauhausRed hover:bg-bauhausRed/90 text-white font-mono text-xs uppercase tracking-widest font-black border-4 border-black shadow-hard-4 flex items-center justify-center gap-2"
        >
          {isGeneratingPlan ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>SYNTHESIZING CONSTRAINTS...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={2.5} />
              <span>
                {saveAsNewEvent ? "SYNTHESIZE NEW EVENT DOSSIER" : "GENERATE MASTER EVENT PLAN"}
              </span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
