"use client";

import React, { useState } from "react";
import { Navbar, NavTab } from "../components/layout/Navbar";
import { DashboardView } from "../components/dashboard/DashboardView";
import { EventIntakeView } from "../components/intake/EventIntakeView";
import { BudgetStudioView } from "../components/budget/BudgetStudioView";
import { TimelineView } from "../components/timeline/TimelineView";
import { VendorManagementView } from "../components/vendors/VendorManagementView";
import { CreativeIdeasView } from "../components/ideas/CreativeIdeasView";
import { AIAssistantView } from "../components/assistant/AIAssistantView";
import { EventManagerModal } from "../components/events/EventManagerModal";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isEventManagerOpen, setIsEventManagerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#121212]">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenEventManager={() => setIsEventManagerOpen(true)}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 focus:outline-none"
      >
        {activeTab === "dashboard" && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenEventManager={() => setIsEventManagerOpen(true)}
          />
        )}
        {activeTab === "intake" && (
          <EventIntakeView
            onNavigate={setActiveTab}
            onOpenEventManager={() => setIsEventManagerOpen(true)}
          />
        )}
        {activeTab === "budget" && <BudgetStudioView />}
        {activeTab === "timeline" && <TimelineView />}
        {activeTab === "vendors" && <VendorManagementView />}
        {activeTab === "ideas" && <CreativeIdeasView />}
        {activeTab === "assistant" && <AIAssistantView />}
      </main>

      {/* Global Event Manager Dialog */}
      <EventManagerModal
        isOpen={isEventManagerOpen}
        onClose={() => setIsEventManagerOpen(false)}
        onNavigateToIntake={() => setActiveTab("intake")}
      />

      {/* Heavy 4px Rule before Footer */}
      <div className="w-full border-t-4 border-black" />

      {/* Bauhaus Colophon Footer */}
      <footer className="bg-[#121212] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-white">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] inline-block" />
                <span className="w-3.5 h-3.5 rounded-none bg-[#1040C0] inline-block" />
                <span className="w-3.5 h-3.5 shape-triangle bg-[#F0C020] inline-block" />
              </div>
              <span className="font-display font-black text-lg tracking-wider uppercase text-white">
                EVENTPILOT
              </span>
              <span className="text-[#F0C020] font-mono text-xs font-bold uppercase">
                / 1920 CONSTRUCTIVIST
              </span>
            </div>
            <p className="text-sm font-medium text-white/70 max-w-md">
              Form follows function. Deterministic constraint validation, budget optimization, and adaptive replanning architected through pure geometry and primary color theory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider">
            <span className="px-3 py-1 bg-[#D02020] text-white border-2 border-white shadow-[2px_2px_0px_0px_white]">
              DETERMINISTIC SOLVER
            </span>
            <span className="px-3 py-1 bg-[#1040C0] text-white border-2 border-white shadow-[2px_2px_0px_0px_white]">
              MULTI-EVENT MATRIX
            </span>
            <span className="px-3 py-1 bg-[#F0C020] text-black border-2 border-white shadow-[2px_2px_0px_0px_white]">
              GOOGLE GENAI SDK
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
