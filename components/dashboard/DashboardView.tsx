"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckSquare,
  Building,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { calculateBudgetSummary } from "../../lib/budget/budgetEngine";
import { formatINR, paiseToRupees } from "../../lib/budget/moneyUtils";
import { daysBetween, formatISODate } from "../../lib/timeline/timelineEngine";
import { NavTab } from "../layout/Navbar";
import { executeReplanning } from "../../lib/ai/aiService";

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { plan, toggleTaskStatus, setActiveProposal } = usePlan();
  const [quickAssistantQuery, setQuickAssistantQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const budgetSummary = calculateBudgetSummary(
    plan.profile.totalBudgetMinor,
    plan.budgetItems,
    plan.profile.guestCount
  );

  const todayStr = formatISODate(new Date());
  const daysRemaining = daysBetween(todayStr, plan.profile.date);

  const completedTasks = plan.tasks.filter((t) => t.status === "completed");
  const overdueTasks = plan.tasks.filter((t) => t.isOverdue && t.status !== "completed");
  const blockedTasks = plan.tasks.filter((t) => t.isBlocked && t.status !== "completed");
  const upcomingTasks = plan.tasks.filter((t) => t.status !== "completed").slice(0, 3);

  const percentSpent =
    plan.profile.totalBudgetMinor > 0
      ? Math.min(
          100,
          Math.round(
            (budgetSummary.totalEstimatedMinor / plan.profile.totalBudgetMinor) * 100
          )
        )
      : 0;

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssistantQuery.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await executeReplanning(quickAssistantQuery, plan);
      if (result.proposals.length > 0) {
        setActiveProposal(result.proposals[0]);
        setQuickAssistantQuery("");
      }
    } catch (err) {
      console.error("Replanning failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleScenarios = [
    "Reduce budget to ₹30,000",
    "We have 20 additional guests",
    "Move party indoors",
    "The caterer cancelled",
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Event Banner */}
      <div className="bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-forest-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-gold-400 text-forest-950 px-2.5 py-0.5 rounded-full">
                Active Plan
              </span>
              <span className="text-xs bg-white/10 text-sand-200 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                {daysRemaining > 0
                  ? `${daysRemaining} days to go`
                  : daysRemaining === 0
                  ? "Today is Event Day!"
                  : "Event Completed"}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Deterministic Verification Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              {plan.profile.name}
            </h1>

            <p className="text-xs sm:text-sm text-sand-200 leading-relaxed">
              {plan.profile.notes}
            </p>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>
                  {plan.profile.date} at {plan.profile.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                <span>
                  {plan.profile.location.venueName ||
                    `${plan.profile.location.city} (${plan.profile.location.venueType})`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-gold-400" />
                <span>{plan.profile.guestCount} Guests</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {plan.profile.dietaryPreferences.join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate("assistant")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold text-xs rounded-xl shadow-md transition"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
            <button
              onClick={() => onNavigate("intake")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 transition"
            >
              <span>Edit Event Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts (if any) */}
      {budgetSummary.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">
                Planning Feasibility Notices ({budgetSummary.warnings.length})
              </h4>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {budgetSummary.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Health Card */}
        <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
              <Wallet className="w-4 h-4 text-gold-600" />
              <span>Budget Health</span>
            </div>
            <button
              onClick={() => onNavigate("budget")}
              className="text-xs text-forest-800 hover:text-forest-950 font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-display text-forest-900">
                  {formatINR(budgetSummary.totalEstimatedMinor)}
                </span>
                <span className="text-xs text-stone-500">
                  of {formatINR(budgetSummary.totalBudgetMinor)} Limit
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-sand-100 rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    budgetSummary.isOverspent ? "bg-rose-600" : "bg-forest-800"
                  }`}
                  style={{ width: `${Math.min(100, percentSpent)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-100 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Buffer Remaining</span>
                <span
                  className={`font-semibold ${
                    budgetSummary.remainingEstimatedMinor >= 0
                      ? "text-emerald-700"
                      : "text-rose-700 font-bold"
                  }`}
                >
                  {formatINR(budgetSummary.remainingEstimatedMinor)}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Contingency Reserve</span>
                <span className="font-semibold text-stone-800">
                  {formatINR(budgetSummary.contingencyMinor)} ({budgetSummary.contingencyPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task & Checklist Progress */}
        <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Checklist Progress</span>
            </div>
            <button
              onClick={() => onNavigate("timeline")}
              className="text-xs text-forest-800 hover:text-forest-950 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-display text-forest-900">
                  {completedTasks.length} / {plan.tasks.length}
                </span>
                <span className="text-xs text-stone-500">
                  {Math.round((completedTasks.length / (plan.tasks.length || 1)) * 100)}%
                  Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-sand-100 rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (completedTasks.length / (plan.tasks.length || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-100 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Overdue Tasks</span>
                <span
                  className={`font-semibold ${
                    overdueTasks.length > 0 ? "text-rose-700 font-bold" : "text-stone-700"
                  }`}
                >
                  {overdueTasks.length}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Blocked Tasks</span>
                <span
                  className={`font-semibold ${
                    blockedTasks.length > 0 ? "text-amber-700" : "text-stone-700"
                  }`}
                >
                  {blockedTasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Status */}
        <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
              <Building className="w-4 h-4 text-purple-600" />
              <span>Vendors & Logistics</span>
            </div>
            <button
              onClick={() => onNavigate("vendors")}
              className="text-xs text-forest-800 hover:text-forest-950 font-semibold flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-display text-forest-900">
                  {plan.vendors.length} Vendors
                </span>
                <span className="text-xs text-stone-500">
                  {plan.vendors.filter((v) => v.bookingStatus === "booked").length} Booked
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Quotes tracked across catering, venue, decor & photography.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-100 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Quotes Total</span>
                <span className="font-semibold text-stone-800">
                  {formatINR(
                    plan.vendors.reduce((s, v) => s + v.estimatedQuoteMinor, 0)
                  )}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Primary Venue</span>
                <span className="font-semibold text-forest-900 truncate block">
                  {plan.profile.location.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Replanning Quick Bar */}
      <div className="bg-sand-50 border border-sand-300 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-forest-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-gold-600" />
          <span>Interactive Adaptive Replanning (What-If Analysis)</span>
        </div>
        <p className="text-xs text-stone-600 mb-4 max-w-2xl leading-relaxed">
          Ask EventPilot to recalculate constraints using natural language. The planning engine will evaluate trade-offs, protect non-negotiables, and show a full change preview before applying.
        </p>

        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickAssistantQuery}
              onChange={(e) => setQuickAssistantQuery(e.target.value)}
              placeholder="e.g. 'My budget is now ₹30,000' or 'We have 20 additional guests'..."
              className="w-full px-4 py-3 bg-white border border-sand-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-forest-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !quickAssistantQuery.trim()}
            className="px-6 py-3 bg-forest-900 hover:bg-forest-850 disabled:bg-stone-300 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
          >
            {isProcessing ? (
              <span>Evaluating...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Simulate Proposal</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Scenario Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-[11px] font-medium text-stone-500">Quick tests:</span>
          {sampleScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => setQuickAssistantQuery(sc)}
              className="text-[11px] bg-white text-stone-700 hover:text-forest-900 hover:border-forest-800 border border-sand-300 px-2.5 py-1 rounded-lg transition"
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Immediate Upcoming Tasks */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-forest-900 font-display">
              Upcoming Action Checklist
            </h3>
            <p className="text-xs text-stone-500">
              Prioritized by due dates and task dependency sequence
            </p>
          </div>
          <button
            onClick={() => onNavigate("timeline")}
            className="text-xs font-semibold text-forest-800 hover:text-forest-950"
          >
            View all {plan.tasks.length} tasks →
          </button>
        </div>

        <div className="divide-y divide-sand-100">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="py-3.5 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                    task.status === "completed"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-sand-400 hover:border-forest-800"
                  }`}
                  aria-label={`Mark ${task.title} as completed`}
                >
                  {task.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div>
                  <h4
                    className={`text-xs sm:text-sm font-semibold ${
                      task.status === "completed"
                        ? "line-through text-stone-400"
                        : "text-stone-900"
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    task.priority === "urgent"
                      ? "bg-rose-100 text-rose-800"
                      : task.priority === "high"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-sand-100 text-stone-700"
                  }`}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                  Due {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
