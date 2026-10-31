"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { calculateBudgetSummary } from "../../lib/budget/budgetEngine";
import { daysBetween, formatISODate } from "../../lib/timeline/timelineEngine";
import { NavTab } from "../layout/Navbar";
import { requestReplanning } from "../../lib/ai/client";
import { Task } from "../../lib/types/event";
import { DashboardHeroPoster } from "./parts/DashboardHeroPoster";
import { DashboardMetricGauges } from "./parts/DashboardMetricGauges";
import { DashboardArchitecturalCards } from "./parts/DashboardArchitecturalCards";
import { DashboardReplanningBar } from "./parts/DashboardReplanningBar";
import { DashboardDirectiveRegister } from "./parts/DashboardDirectiveRegister";

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

const SAMPLE_SCENARIOS = [
  "Reduce budget to ₹30,000",
  "We have 20 additional guests",
  "Move party indoors",
  "The caterer cancelled",
];

export function DashboardView({ onNavigate, onOpenEventManager }: DashboardViewProps) {
  const { plan, plans, toggleTaskStatus, setActiveProposal } = usePlan();
  const [quickAssistantQuery, setQuickAssistantQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const budgetSummary = useMemo(
    () => calculateBudgetSummary(plan.profile.totalBudgetMinor, plan.budgetItems, plan.profile.guestCount),
    [plan.profile.totalBudgetMinor, plan.budgetItems, plan.profile.guestCount]
  );

  const todayStr = formatISODate(new Date());
  const daysRemaining = daysBetween(todayStr, plan.profile.date);

  const {
    completedTasksCount,
    overdueTasksCount,
    blockedTasksCount,
    upcomingTasks,
    bookedVendorsCount,
    totalVendorQuotesMinor,
    vendorSectorCount,
  } = useMemo(() => {
    let completedCount = 0;
    let overdueCount = 0;
    let blockedCount = 0;
    const upcoming: Task[] = [];

    for (const task of plan.tasks) {
      if (task.status === "completed") {
        completedCount++;
      } else {
        if (upcoming.length < 4) upcoming.push(task);
        if (task.isOverdue) overdueCount++;
        if (task.isBlocked) blockedCount++;
      }
    }

    let bookedCount = 0;
    let totalQuotes = 0;
    const sectors = new Set<string>();

    for (const vendor of plan.vendors) {
      if (vendor.bookingStatus === "booked") bookedCount++;
      totalQuotes += vendor.estimatedQuoteMinor;
      sectors.add(vendor.category);
    }

    return {
      completedTasksCount: completedCount,
      overdueTasksCount: overdueCount,
      blockedTasksCount: blockedCount,
      upcomingTasks: upcoming,
      bookedVendorsCount: bookedCount,
      totalVendorQuotesMinor: totalQuotes,
      vendorSectorCount: sectors.size,
    };
  }, [plan.tasks, plan.vendors]);

  const handleToggleTask = useCallback((id: string) => toggleTaskStatus(id), [toggleTaskStatus]);

  const percentSpent =
    plan.profile.totalBudgetMinor > 0
      ? Math.min(100, Math.round((budgetSummary.totalEstimatedMinor / plan.profile.totalBudgetMinor) * 100))
      : 0;

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssistantQuery.trim() || isProcessing) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await requestReplanning(quickAssistantQuery, plan, controller.signal);
      if (result.proposals.length > 0) {
        setActiveProposal(result.proposals[0]);
        setQuickAssistantQuery("");
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Unable to analyze the requested change.");
    } finally {
      if (!controller.signal.aborted) {
        setIsProcessing(false);
      }
    }
  };

  const dossierIndex = plans.findIndex((p) => p.profile.id === plan.profile.id);

  return (
    <div className="space-y-12 pb-12">
      <DashboardHeroPoster
        plan={plan}
        dossierIndex={dossierIndex}
        totalPlansCount={plans.length}
        daysRemaining={daysRemaining}
        onNavigate={onNavigate}
        onOpenEventManager={onOpenEventManager}
      />

      <DashboardMetricGauges plan={plan} percentSpent={percentSpent} />

      {budgetSummary.warnings.length > 0 && (
        <section className="border-4 border-black p-6 bg-[#D02020] text-white shadow-[6px_6px_0px_0px_black] space-y-3">
          <div className="flex items-center gap-3 border-b-2 border-white pb-2">
            <AlertCircle size={20} strokeWidth={2.5} className="text-white shrink-0" />
            <h2 className="font-mono uppercase tracking-widest text-xs font-black text-white">
              CONSTRAINT INFEASIBILITY WARNINGS ({budgetSummary.warnings.length})
            </h2>
          </div>
          <ul className="space-y-1 text-xs font-bold font-mono text-white">
            {budgetSummary.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>[!]</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DashboardArchitecturalCards
        budgetSummary={budgetSummary}
        percentSpent={percentSpent}
        completedTasksCount={completedTasksCount}
        totalTasksCount={plan.tasks.length}
        overdueTasksCount={overdueTasksCount}
        blockedTasksCount={blockedTasksCount}
        vendorsCount={plan.vendors.length}
        bookedVendorsCount={bookedVendorsCount}
        venueCity={plan.profile.location.city}
        totalVendorQuotesMinor={totalVendorQuotesMinor}
        vendorSectorCount={vendorSectorCount}
        onNavigate={onNavigate}
      />

      <DashboardReplanningBar
        query={quickAssistantQuery}
        onQueryChange={setQuickAssistantQuery}
        onSubmit={handleQuickSubmit}
        isProcessing={isProcessing}
        error={error}
        sampleScenarios={SAMPLE_SCENARIOS}
      />

      <DashboardDirectiveRegister
        upcomingTasks={upcomingTasks}
        totalTasksCount={plan.tasks.length}
        onNavigate={onNavigate}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}
