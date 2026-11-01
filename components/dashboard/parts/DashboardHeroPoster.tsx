import React from "react";
import { ShieldCheck, Layers, Bot, Calendar, MapPin, Users } from "lucide-react";
import { EventPlan } from "../../../lib/types/event";
import { NavTab } from "../../layout/Navbar";

interface DashboardHeroPosterProps {
  plan: EventPlan;
  dossierIndex: number;
  totalPlansCount: number;
  daysRemaining: number;
  onNavigate: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

export function DashboardHeroPoster({
  plan,
  dossierIndex,
  totalPlansCount,
  daysRemaining,
  onNavigate,
  onOpenEventManager,
}: DashboardHeroPosterProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left Column: Massive Headline & Dossier Context */}
      <div className="lg:col-span-7 bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest bg-[#D02020] text-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black]">
              DOSSIER NO. {dossierIndex + 1}
            </span>
            <span className="text-xs font-black uppercase tracking-widest bg-[#F0C020] text-black border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={2.5} />
              DETERMINISTIC VERIFICATION ACTIVE
            </span>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-black/70 mb-1">
              FORM FOLLOWS FUNCTION / 1920 MODERNISM
            </p>
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tighter text-black uppercase leading-[0.88]">
              {plan.profile.name}
            </h1>
            <div className="flex items-center gap-3 pt-3">
              <span className="w-5 h-5 rounded-full bg-[#D02020] border-2 border-black shrink-0" />
              <span className="w-5 h-5 rounded-none bg-[#1040C0] border-2 border-black shrink-0" />
              <span className="w-5 h-5 shape-triangle bg-[#F0C020] border-b-2 border-black shrink-0" />
              <div className="h-1 flex-1 bg-black" />
              <span className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black">
                ARCHITECTED
              </span>
            </div>
          </div>

          <p className="font-medium text-base sm:text-lg text-[#121212] leading-relaxed pt-2">
            {plan.profile.notes ||
              "Every celebration is a geometric composition of resources, schedule, and non-negotiables—calculated deterministically."}
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t-4 border-black">
          {onOpenEventManager && (
            <button
              onClick={onOpenEventManager}
              className="btn-bauhaus px-4 py-2.5 bg-white hover:bg-[#F0C020] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2"
            >
              <Layers size={14} strokeWidth={2.5} />
              <span>SWITCH DOSSIER ({totalPlansCount})</span>
            </button>
          )}
          <button
            onClick={() => onNavigate("intake")}
            className="btn-bauhaus px-4 py-2.5 bg-[#1040C0] text-white hover:bg-[#1040C0]/90 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_black]"
          >
            EDIT SPECIFICATION
          </button>
          <button
            onClick={() => onNavigate("assistant")}
            className="btn-bauhaus px-4 py-2.5 bg-[#D02020] text-white hover:bg-[#D02020]/90 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2"
          >
            <Bot size={14} strokeWidth={2.5} />
            <span>AI REPLANNER</span>
          </button>
        </div>
      </div>

      {/* Right Column: Bauhaus Blue Panel with Overlapping Geometric Composition */}
      <div className="lg:col-span-5 bg-[#1040C0] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-[#D02020] border-4 border-black shadow-[4px_4px_0px_0px_black] pointer-events-none opacity-80" />
        <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-[#F0C020] border-4 border-black shadow-[6px_6px_0px_0px_black] rotate-12 pointer-events-none opacity-80" />
        <div className="absolute top-1/2 left-8 w-16 h-16 shape-triangle bg-white border-b-4 border-black -rotate-45 pointer-events-none opacity-40" />

        <div className="relative z-10 space-y-4">
          <div className="inline-block px-3 py-1 bg-white text-black font-black text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_black]">
            SPECIFICATION METADATA
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-white text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3 font-bold text-xs">
              <Calendar size={18} strokeWidth={2.5} className="text-[#D02020] shrink-0" />
              <span>
                DATE: {plan.profile.date} AT {plan.profile.time} HRS
              </span>
            </div>
            <div className="bg-white text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3 font-bold text-xs">
              <MapPin size={18} strokeWidth={2.5} className="text-[#1040C0] shrink-0" />
              <span className="truncate">
                VENUE: {plan.profile.location.city} ({plan.profile.location.venueType.toUpperCase()}
                )
              </span>
            </div>
            <div className="bg-white text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3 font-bold text-xs">
              <Users size={18} strokeWidth={2.5} className="text-[#F0C020] shrink-0" />
              <span>CENSUS: {plan.profile.guestCount} GUESTS</span>
            </div>
            <div className="bg-[#FFF9C4] text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3 font-black text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border border-black shrink-0" />
              <span>MANDATE: {plan.profile.dietaryPreferences.join(" • ").toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6">
          <div className="p-4 bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_black]">
            <span className="font-mono text-[10px] uppercase font-bold text-black/70 block">
              ANCHOR COUNTDOWN
            </span>
            <div className="font-display font-black text-2xl uppercase">
              {daysRemaining > 0
                ? `${daysRemaining} DAYS REMAINING`
                : daysRemaining === 0
                  ? "EVENT COMMENCES TODAY"
                  : "EVENT CONCLUDED"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
