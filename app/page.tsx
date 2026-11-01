"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar, type NavTab } from "../components/layout/Navbar";
import { DashboardView } from "../components/dashboard/DashboardView";

const TabLoadingFallback = () => (
  <small
    role="status"
    className="font-mono text-xs uppercase tracking-widest font-bold text-black/60 p-6 block"
  >
    LOADING DIRECTIVE...
  </small>
);

const EventIntakeView = dynamic(
  () => import("../components/intake/EventIntakeView").then((m) => m.EventIntakeView),
  { loading: TabLoadingFallback }
);

const BudgetStudioView = dynamic(
  () => import("../components/budget/BudgetStudioView").then((m) => m.BudgetStudioView),
  { loading: TabLoadingFallback }
);

const TimelineView = dynamic(
  () => import("../components/timeline/TimelineView").then((m) => m.TimelineView),
  { loading: TabLoadingFallback }
);

const VendorManagementView = dynamic(
  () => import("../components/vendors/VendorManagementView").then((m) => m.VendorManagementView),
  { loading: TabLoadingFallback }
);

const CreativeIdeasView = dynamic(
  () => import("../components/ideas/CreativeIdeasView").then((m) => m.CreativeIdeasView),
  { loading: TabLoadingFallback }
);

const AIAssistantView = dynamic(
  () => import("../components/assistant/AIAssistantView").then((m) => m.AIAssistantView),
  { loading: TabLoadingFallback }
);

const EventManagerModal = dynamic(
  () => import("../components/events/EventManagerModal").then((m) => m.EventManagerModal),
  {
    loading: () => (
      <small role="status" className="sr-only">
        LOADING MODAL...
      </small>
    ),
  }
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isEventManagerOpen, setIsEventManagerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bauhausCanvas text-bauhausBlack">
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
      <footer className="bg-bauhausBlack text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-white">
                <span className="w-3.5 h-3.5 rounded-full bg-bauhausRed inline-block" />
                <span className="w-3.5 h-3.5 rounded-none bg-bauhausBlue inline-block" />
                <span className="w-3.5 h-3.5 shape-triangle bg-bauhausYellow inline-block" />
              </div>
              <span className="font-display font-black text-lg tracking-wider uppercase text-white">
                EVENTPILOT
              </span>
              <span className="text-bauhausYellow font-mono text-xs font-bold uppercase">
                / 1920 CONSTRUCTIVIST
              </span>
            </div>
            <p className="text-sm font-medium text-white/70 max-w-md">
              Form follows function. Deterministic constraint validation, budget optimization, and
              adaptive replanning architected through pure geometry and primary color theory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider">
            <span className="px-3 py-1 bg-bauhausRed text-white border-2 border-white shadow-hard-white-2">
              DETERMINISTIC SOLVER
            </span>
            <span className="px-3 py-1 bg-bauhausBlue text-white border-2 border-white shadow-hard-white-2">
              MULTI-EVENT MATRIX
            </span>
            <span className="px-3 py-1 bg-bauhausYellow text-black border-2 border-white shadow-hard-white-2">
              GOOGLE GENAI SDK
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
