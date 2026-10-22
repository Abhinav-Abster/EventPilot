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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "dashboard" && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === "intake" && <EventIntakeView onNavigate={setActiveTab} />}
        {activeTab === "budget" && <BudgetStudioView />}
        {activeTab === "timeline" && <TimelineView />}
        {activeTab === "vendors" && <VendorManagementView />}
        {activeTab === "ideas" && <CreativeIdeasView />}
        {activeTab === "assistant" && <AIAssistantView />}
      </main>

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-sand-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center">
            <span>EventPilot</span>
            <span>•</span>
            <span>Plan smarter. Spend better. Celebrate without chaos.</span>
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Deterministic Constraint Solver</span>
            <span>•</span>
            <span>Google GenAI SDK Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
