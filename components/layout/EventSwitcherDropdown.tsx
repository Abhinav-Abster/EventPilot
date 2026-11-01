import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, Layers } from "lucide-react";
import { EventPlan } from "../../lib/types/event";

interface EventSwitcherDropdownProps {
  currentPlan: EventPlan;
  plans: EventPlan[];
  activePlanId: string;
  onSwitchEvent: (id: string) => void;
  onOpenEventManager?: () => void;
}

export function EventSwitcherDropdown({
  currentPlan,
  plans,
  activePlanId,
  onSwitchEvent,
  onOpenEventManager,
}: EventSwitcherDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-bauhausYellow text-black border-2 border-black shadow-hard-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-bold uppercase tracking-wider transition-all max-w-[210px] lg:max-w-[260px]"
        aria-expanded={open}
        aria-haspopup="true"
        title="Switch active event dossier"
      >
        <span className="w-3 h-3 rounded-full bg-bauhausRed border border-black shrink-0" />
        <span className="truncate text-left flex-1 font-bold">{currentPlan.profile.name}</span>
        <span className="text-micro bg-bauhausBlue text-white px-1.5 py-0.5 border border-black shrink-0 font-black">
          {plans.length}
        </span>
        <ChevronDown size={14} strokeWidth={2.5} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border-4 border-black shadow-hard-8 p-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between border-b-4 border-black bg-bauhausYellow text-xs font-black uppercase tracking-wider text-black">
            <span>DOSSIER SELECTOR ({plans.length})</span>
            {onOpenEventManager && (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenEventManager();
                }}
                className="text-black font-black underline hover:bg-black hover:text-white px-1 transition"
              >
                MANAGE
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y-2 divide-black">
            {plans.map((p) => {
              const isItemActive = p.profile.id === activePlanId;
              return (
                <button
                  key={p.profile.id}
                  onClick={() => {
                    onSwitchEvent(p.profile.id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-start justify-between gap-2 text-xs transition-colors ${
                    isItemActive
                      ? "bg-bauhausBlue text-white font-black"
                      : "text-black hover:bg-bauhausLightYellow"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-black text-sm uppercase truncate">{p.profile.name}</div>
                    <div
                      className={`text-tiny font-bold uppercase tracking-wider truncate mt-0.5 ${
                        isItemActive ? "text-bauhausYellow" : "text-bauhausBlack/70"
                      }`}
                    >
                      {p.profile.date} • {p.profile.location.city} • {p.profile.guestCount} GUESTS
                    </div>
                  </div>
                  {isItemActive && (
                    <Check size={16} strokeWidth={3} className="shrink-0 mt-1 text-bauhausYellow" />
                  )}
                </button>
              );
            })}
          </div>

          {onOpenEventManager && (
            <div className="p-3 border-t-4 border-black bg-bauhausCanvas">
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenEventManager();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-white bg-bauhausRed hover:bg-bauhausRed/90 border-2 border-black shadow-hard-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Layers size={14} strokeWidth={2.5} />
                <span>OPEN EVENT MANAGER</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
