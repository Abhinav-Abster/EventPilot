"use client";

import React, { useState } from "react";
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
  Layers,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { EventSwitcherDropdown } from "./EventSwitcherDropdown";

export type NavTab =
  "dashboard" | "intake" | "budget" | "timeline" | "vendors" | "ideas" | "assistant";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

export function Navbar({ activeTab, onTabChange, onOpenEventManager }: NavbarProps) {
  const { plan, plans, activePlanId, switchEvent } = usePlan();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <div className="flex items-center gap-1.5 shrink-0 p-1 border-2 border-black bg-white shadow-[3px_3px_0px_0px_black] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_black] transition-all">
                <span
                  className="w-4 h-4 rounded-full bg-[#D02020] inline-block border border-black"
                  title="Circle"
                />
                <span
                  className="w-4 h-4 rounded-none bg-[#1040C0] inline-block border border-black"
                  title="Square"
                />
                <span
                  className="w-4 h-4 shape-triangle bg-[#F0C020] inline-block border-b-2 border-black"
                  title="Triangle"
                />
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

            <EventSwitcherDropdown
              currentPlan={plan}
              plans={plans}
              activePlanId={activePlanId}
              onSwitchEvent={switchEvent}
              onOpenEventManager={onOpenEventManager}
            />
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
              {mobileMenuOpen ? (
                <X size={20} strokeWidth={2.5} />
              ) : (
                <Menu size={20} strokeWidth={2.5} />
              )}
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
