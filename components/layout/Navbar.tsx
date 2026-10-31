"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  Calendar,
  Wallet,
  CheckSquare,
  Users,
  Lightbulb,
  Bot,
  Menu,
  X,
  ChevronDown,
  Check,
  Layers,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";

export type NavTab =
  | "dashboard"
  | "intake"
  | "budget"
  | "timeline"
  | "vendors"
  | "ideas"
  | "assistant";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

export function Navbar({ activeTab, onTabChange, onOpenEventManager }: NavbarProps) {
  const { plan, plans, activePlanId, switchEvent } = usePlan();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: "dashboard", label: "Dashboard", icon: <Compass size={16} strokeWidth={2.5} /> },
    { id: "intake", label: "Intake", icon: <Calendar size={16} strokeWidth={2.5} /> },
    { id: "budget", label: "Budget", icon: <Wallet size={16} strokeWidth={2.5} /> },
    { id: "timeline", label: "Timeline", icon: <CheckSquare size={16} strokeWidth={2.5} /> },
    { id: "vendors", label: "Vendors", icon: <Users size={16} strokeWidth={2.5} /> },
    { id: "ideas", label: "Ideas", icon: <Lightbulb size={16} strokeWidth={2.5} /> },
    { id: "assistant", label: "Assistant", icon: <Bot size={16} strokeWidth={2.5} /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEventDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F0F0F0] border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Bauhaus Brand Mark (Circle, Square, Triangle in Primary Colors) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTabClick("dashboard")}
              className="flex items-center gap-3 text-left group shrink-0 focus-visible:outline-black focus-visible:outline-offset-4"
              aria-label="EventPilot Home"
            >
              {/* Three Geometric Bauhaus Shapes */}
              <div className="flex items-center gap-1.5 shrink-0 p-1 border-2 border-black bg-white shadow-[3px_3px_0px_0px_black] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_black] transition-all">
                <span className="w-4 h-4 rounded-full bg-[#D02020] inline-block border border-black" title="Circle" />
                <span className="w-4 h-4 rounded-none bg-[#1040C0] inline-block border border-black" title="Square" />
                <span className="w-4 h-4 shape-triangle bg-[#F0C020] inline-block border-b-2 border-black" title="Triangle" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl tracking-tighter uppercase text-black">
                    EVENTPILOT
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#F0C020] text-black border-2 border-black px-1.5 py-0.2 shadow-[2px_2px_0px_0px_black]">
                    BAUHAUS
                  </span>
                </div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-[#121212]/70 hidden sm:block">
                  Form Follows Function
                </p>
              </div>
            </button>

            {/* Event Switcher Dropdown (Desktop) */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#F0C020] text-black border-2 border-black shadow-[3px_3px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-bold uppercase tracking-wider transition-all max-w-[210px] lg:max-w-[260px]"
                aria-expanded={eventDropdownOpen}
                aria-haspopup="true"
                title="Switch active event dossier"
              >
                <span className="w-3 h-3 rounded-full bg-[#D02020] border border-black shrink-0" />
                <span className="truncate text-left flex-1 font-bold">
                  {plan.profile.name}
                </span>
                <span className="text-[10px] bg-[#1040C0] text-white px-1.5 py-0.5 border border-black shrink-0 font-black">
                  {plans.length}
                </span>
                <ChevronDown size={14} strokeWidth={2.5} className="shrink-0" />
              </button>

              {eventDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-0 z-50">
                  <div className="px-4 py-3 flex items-center justify-between border-b-4 border-black bg-[#F0C020] text-xs font-black uppercase tracking-wider text-black">
                    <span>DOSSIER SELECTOR ({plans.length})</span>
                    {onOpenEventManager && (
                      <button
                        onClick={() => {
                          setEventDropdownOpen(false);
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
                            switchEvent(p.profile.id);
                            setEventDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-start justify-between gap-2 text-xs transition-colors ${
                            isItemActive
                              ? "bg-[#1040C0] text-white font-black"
                              : "text-black hover:bg-[#FFF9C4]"
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-black text-sm uppercase truncate">{p.profile.name}</div>
                            <div
                              className={`text-[11px] font-bold uppercase tracking-wider truncate mt-0.5 ${
                                isItemActive ? "text-[#F0C020]" : "text-[#121212]/70"
                              }`}
                            >
                              {p.profile.date} • {p.profile.location.city} • {p.profile.guestCount} GUESTS
                            </div>
                          </div>
                          {isItemActive && (
                            <Check size={16} strokeWidth={3} className="shrink-0 mt-1 text-[#F0C020]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {onOpenEventManager && (
                    <div className="p-3 border-t-4 border-black bg-[#F0F0F0]">
                      <button
                        onClick={() => {
                          setEventDropdownOpen(false);
                          onOpenEventManager();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#D02020] hover:bg-[#D02020]/90 border-2 border-black shadow-[3px_3px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                        <Layers size={14} strokeWidth={2.5} />
                        <span>OPEN EVENT MANAGER</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-black border-2 border-black transition-all btn-bauhaus ${
                    isActive
                      ? "bg-[#D02020] text-white shadow-[4px_4px_0px_0px_black] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-white text-black shadow-[3px_3px_0px_0px_black] hover:bg-[#F0C020] hover:text-black"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {onOpenEventManager && (
              <button
                onClick={onOpenEventManager}
                className="p-2 bg-[#F0C020] text-black border-2 border-black shadow-[3px_3px_0px_0px_black] text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                aria-label="Manage Events"
              >
                <Layers size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">DOSSIERS</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white border-2 border-black shadow-[3px_3px_0px_0px_black] text-black hover:bg-[#D02020] hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-4 border-black bg-white p-4 space-y-3">
          <div className="p-3 border-2 border-black bg-[#F0C020] shadow-[3px_3px_0px_0px_black] flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                ACTIVE PLAN ({plans.length} TOTAL)
              </span>
              <span className="text-sm font-black text-black uppercase truncate block">
                {plan.profile.name}
              </span>
            </div>
            {onOpenEventManager && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEventManager();
                }}
                className="px-3 py-1.5 bg-black text-white text-[11px] font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_black]"
              >
                SWITCH
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-black border-2 border-black transition-all ${
                    isActive
                      ? "bg-[#D02020] text-white shadow-[4px_4px_0px_0px_black]"
                      : "bg-[#F0F0F0] text-black shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
