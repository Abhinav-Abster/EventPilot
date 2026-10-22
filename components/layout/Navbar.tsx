"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  Wallet,
  CheckSquare,
  Users,
  Lightbulb,
  Bot,
  RotateCcw,
  Menu,
  X,
  Compass,
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
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { plan, resetToDemo, demoMode, setDemoMode } = usePlan();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: "dashboard", label: "Dashboard", icon: <Compass className="w-4 h-4" /> },
    { id: "intake", label: "Event Intake", icon: <Calendar className="w-4 h-4" /> },
    { id: "budget", label: "Budget Studio", icon: <Wallet className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline & Checklist", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "vendors", label: "Vendors", icon: <Users className="w-4 h-4" /> },
    { id: "ideas", label: "Creative Ideas", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "assistant", label: "AI Assistant", icon: <Bot className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleReset = () => {
    resetToDemo();
    setShowResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-sand-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick("dashboard")}
              className="flex items-center gap-2.5 text-left group"
              aria-label="EventPilot Home"
            >
              <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-md group-hover:bg-forest-850 transition">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-xl tracking-tight text-forest-900">
                    EventPilot
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-gold-100 text-gold-800 px-1.5 py-0.5 rounded">
                    GenAI
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  Plan smarter. Spend better. Celebrate without chaos.
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-forest-900 text-white shadow-sm"
                      : "text-stone-700 hover:text-forest-900 hover:bg-sand-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Demo Mode Toggle & Reset Demo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Badge */}
            <div className="flex items-center gap-1.5 bg-sand-100 border border-sand-300 px-2.5 py-1 rounded-full text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  demoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              <span className="font-medium text-stone-700 hidden sm:inline">
                {demoMode ? "Demo Mode (Deterministic)" : "Gemini Live Mode"}
              </span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className="text-[10px] text-forest-800 underline hover:text-forest-950 font-semibold ml-1"
                title="Toggle between deterministic demo data and live Gemini API calls"
              >
                {demoMode ? "Switch to Live" : "Switch to Demo"}
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-sand-300 rounded-lg transition"
              title="Reset application to canonical sample event"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-forest-900 hover:bg-sand-100"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sand-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-forest-900 text-white font-semibold"
                    : "text-stone-700 hover:bg-sand-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <h3 id="reset-title" className="text-lg font-bold text-stone-900 mb-2">
              Reset to Canonical Demo?
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              This will restore the original reference plan: <strong>Aanya&apos;s 18th Anime Birthday Bash</strong> in Pune for 60 guests with the ₹40,000 budget and default checklist.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-sand-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition"
              >
                Yes, Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
