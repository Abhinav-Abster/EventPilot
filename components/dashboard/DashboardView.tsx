"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckSquare,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Bot,
  ShieldCheck,
  Building,
  Layers,
  Check,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { calculateBudgetSummary } from "../../lib/budget/budgetEngine";
import { formatINR } from "../../lib/budget/moneyUtils";
import { daysBetween, formatISODate } from "../../lib/timeline/timelineEngine";
import { NavTab } from "../layout/Navbar";
import { requestReplanning } from "../../lib/ai/client";

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

export function DashboardView({ onNavigate, onOpenEventManager }: DashboardViewProps) {
  const { plan, plans, toggleTaskStatus, setActiveProposal } = usePlan();
  const [quickAssistantQuery, setQuickAssistantQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const upcomingTasks = plan.tasks.filter((t) => t.status !== "completed").slice(0, 4);

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
    setError(null);
    try {
      const result = await requestReplanning(quickAssistantQuery, plan);
      if (result.proposals.length > 0) {
        setActiveProposal(result.proposals[0]);
        setQuickAssistantQuery("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze the requested change.");
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
    <div className="space-y-12 pb-12">
      {/* 1. Bauhaus Hero Constructivist Poster Composition */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Massive Headline & Dossier Context */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest bg-[#D02020] text-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black]">
                DOSSIER NO. {plans.findIndex((p) => p.profile.id === plan.profile.id) + 1}
              </span>
              <span className="text-xs font-black uppercase tracking-widest bg-[#F0C020] text-black border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] flex items-center gap-1.5">
                <ShieldCheck size={14} strokeWidth={2.5} />
                DETERMINISTIC VERIFICATION ACTIVE
              </span>
            </div>

            {/* Massive Constructivist Headline */}
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
                <span>SWITCH DOSSIER ({plans.length})</span>
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
          {/* Abstract Overlapping Geometric Shapes */}
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
                <span>DATE: {plan.profile.date} AT {plan.profile.time} HRS</span>
              </div>
              <div className="bg-white text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3 font-bold text-xs">
                <MapPin size={18} strokeWidth={2.5} className="text-[#1040C0] shrink-0" />
                <span className="truncate">VENUE: {plan.profile.location.city} ({plan.profile.location.venueType.toUpperCase()})</span>
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

      {/* 2. Mandatory Color Blocking: Solid Bauhaus Yellow Stats Section */}
      <section className="bg-[#F0C020] text-black border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 bg-black inline-block" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-black">
              METRIC CONSTRUCT & TEMPORAL DISCIPLINE
            </h2>
          </div>
          <span className="font-mono text-xs font-black uppercase tracking-widest bg-white text-black border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black]">
            4 SYNCHRONIZED GAUGES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1: Target Date */}
          <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_black] space-y-2 relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border-2 border-black absolute top-3 right-3" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block">
              01 / COMMENCEMENT
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">
              {plan.profile.date}
            </div>
            <div className="font-mono text-xs font-bold text-black/80">
              {plan.profile.time} HRS
            </div>
          </div>

          {/* Stat 2: Location */}
          <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_black] space-y-2 relative">
            <span className="w-3.5 h-3.5 rounded-none bg-[#1040C0] border-2 border-black absolute top-3 right-3" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block">
              02 / LOCATION
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-black truncate">
              {plan.profile.location.city}
            </div>
            <div className="font-bold text-xs text-black/80 uppercase truncate">
              {plan.profile.location.venueName || plan.profile.location.venueType}
            </div>
          </div>

          {/* Stat 3: Guest Census */}
          <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_black] space-y-2 relative">
            <span className="w-3.5 h-3.5 shape-triangle bg-[#F0C020] border-b-2 border-black absolute top-3 right-3" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block">
              03 / GUEST CENSUS
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">
              {plan.profile.guestCount} PAX
            </div>
            <div className="font-mono text-xs font-bold text-black/80 uppercase">
              {plan.profile.dietaryPreferences.join(" • ") || "STANDARD"}
            </div>
          </div>

          {/* Stat 4: Total Allocation */}
          <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_black] space-y-2 relative">
            <span className="w-3.5 h-3.5 bg-black rotate-45 border border-black absolute top-3 right-3" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block">
              04 / TOTAL BUDGET
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">
              {formatINR(plan.profile.totalBudgetMinor)}
            </div>
            <div className="font-mono text-xs font-bold text-[#D02020] uppercase">
              {percentSpent}% COMMITTED
            </div>
          </div>
        </div>
      </section>

      {/* Warnings & Infeasibility Notices */}
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

      {/* 3. Three Primary Bauhaus Architectural Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Budget Ledger (Red Corner Accent) */}
        <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between relative">
          {/* Geometric Corner Shape */}
          <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-black absolute top-4 right-4" title="Circle Accent" />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
                <Wallet size={18} strokeWidth={2.5} className="text-[#D02020]" />
                <span>CAPEX LEDGER</span>
              </div>
              <button
                onClick={() => onNavigate("budget")}
                className="font-mono text-xs uppercase tracking-wider font-bold underline hover:bg-black hover:text-white px-1"
              >
                OPEN →
              </button>
            </div>

            <div>
              <div className="font-display font-black text-4xl text-black">
                {formatINR(budgetSummary.totalEstimatedMinor)}
              </div>
              <div className="font-mono text-xs font-bold text-black/60 pt-1">
                OF {formatINR(budgetSummary.totalBudgetMinor)} ALLOCATED
              </div>
            </div>

            {/* Hard Contrast Progress Bar */}
            <div className="w-full border-2 border-black h-4 bg-[#F0F0F0] p-0.5">
              <div
                className="h-full bg-[#D02020] transition-all duration-300"
                style={{ width: `${Math.min(100, percentSpent)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                REMAINING
              </span>
              <span className="font-black text-black text-sm">
                {formatINR(budgetSummary.remainingEstimatedMinor)}
              </span>
            </div>
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                CONTINGENCY
              </span>
              <span className="font-black text-black text-sm">
                {budgetSummary.contingencyPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Execution Directives (Blue Corner Accent) */}
        <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between relative">
          {/* Geometric Corner Shape */}
          <span className="w-4 h-4 rounded-none bg-[#1040C0] border-2 border-black absolute top-4 right-4" title="Square Accent" />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
                <CheckSquare size={18} strokeWidth={2.5} className="text-[#1040C0]" />
                <span>DIRECTIVE MATRIX</span>
              </div>
              <button
                onClick={() => onNavigate("timeline")}
                className="font-mono text-xs uppercase tracking-wider font-bold underline hover:bg-black hover:text-white px-1"
              >
                TIMELINE →
              </button>
            </div>

            <div>
              <div className="font-display font-black text-4xl text-black">
                {completedTasks.length} / {plan.tasks.length}
              </div>
              <div className="font-mono text-xs font-bold text-black/60 pt-1">
                {Math.round((completedTasks.length / (plan.tasks.length || 1)) * 100)}% COMPLETE
              </div>
            </div>

            {/* Hard Progress Bar */}
            <div className="w-full border-2 border-black h-4 bg-[#F0F0F0] p-0.5">
              <div
                className="h-full bg-[#1040C0] transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (completedTasks.length / (plan.tasks.length || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                OVERDUE
              </span>
              <span className="font-black text-[#D02020] text-sm">
                {overdueTasks.length} DIRECTIVES
              </span>
            </div>
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                BLOCKED
              </span>
              <span className="font-black text-black text-sm">
                {blockedTasks.length} DIRECTIVES
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Vendor Roster (Yellow Corner Accent) */}
        <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between relative">
          {/* Geometric Corner Shape */}
          <span className="w-4 h-4 shape-triangle bg-[#F0C020] border-b-2 border-black absolute top-4 right-4" title="Triangle Accent" />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
                <Building size={18} strokeWidth={2.5} className="text-[#F0C020]" />
                <span>VENDOR ROSTER</span>
              </div>
              <button
                onClick={() => onNavigate("vendors")}
                className="font-mono text-xs uppercase tracking-wider font-bold underline hover:bg-black hover:text-white px-1"
              >
                ROSTER →
              </button>
            </div>

            <div>
              <div className="font-display font-black text-4xl text-black">
                {plan.vendors.length} CONTRACTS
              </div>
              <div className="font-mono text-xs font-bold text-black/60 pt-1">
                {plan.vendors.filter((v) => v.bookingStatus === "booked").length} CONFIRMED BOOKINGS
              </div>
            </div>

            <div className="p-2 border-2 border-black bg-[#FFF9C4] text-[11px] font-black uppercase tracking-wider">
              PRIMARY VENUE: {plan.profile.location.city}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                TOTAL QUOTES
              </span>
              <span className="font-black text-black text-sm">
                {formatINR(
                  plan.vendors.reduce((s, v) => s + v.estimatedQuoteMinor, 0)
                )}
              </span>
            </div>
            <div>
              <span className="text-black/60 block text-[10px] uppercase font-bold">
                COVERAGE
              </span>
              <span className="font-black text-black text-sm">
                {new Set(plan.vendors.map((v) => v.category)).size} SECTORS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Adaptive Replanning Simulation Bar (Solid Bauhaus Blue Panel) */}
      <section className="bg-[#1040C0] text-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-black text-[#F0C020]">
            <Sparkles size={18} strokeWidth={2.5} />
            <span>ADAPTIVE REPLANNING CONSTRUCT</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            WHAT-IF ADAPTATION SOLVER
          </h2>
          <p className="text-sm font-medium text-white/90 max-w-3xl leading-relaxed">
            Instruct the deterministic solver in natural language. Trade-offs are evaluated against non-negotiable boundaries and visualized in a side-by-side diff matrix.
          </p>
        </div>

        {error && (
          <div role="alert" className="border-4 border-black bg-[#D02020] text-white p-4 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_black]">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickAssistantQuery}
              onChange={(e) => setQuickAssistantQuery(e.target.value)}
              placeholder="State disruption: e.g. 'Reduce budget to ₹30,000' or '20 more guests arrive'..."
              className="w-full px-5 py-4 bg-white border-4 border-black text-sm text-black font-bold placeholder:text-black/50 shadow-[4px_4px_0px_0px_black] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !quickAssistantQuery.trim()}
            className="btn-bauhaus px-8 py-4 bg-[#F0C020] hover:bg-[#F0C020]/90 text-black border-4 border-black shadow-[4px_4px_0px_0px_black] text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>SOLVING...</span>
            ) : (
              <>
                <span>SIMULATE PROPOSAL</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-white/30 text-xs font-mono">
          <span className="uppercase text-[#F0C020] text-[11px] font-black tracking-wider">
            SCENARIO PRESETS:
          </span>
          {sampleScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => setQuickAssistantQuery(sc)}
              className="px-3 py-1.5 border-2 border-black bg-white text-black hover:bg-[#F0C020] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_black] transition-all"
            >
              {sc}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Priority Directives Checklist */}
      <section className="bg-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
              PRIORITY DIRECTIVE REGISTER
            </h2>
            <p className="font-mono text-xs font-bold text-black/60 uppercase">
              TOPOLOGICALLY SEQUENCED BY CRITICAL MILESTONE PROXIMITY
            </p>
          </div>
          <button
            onClick={() => onNavigate("timeline")}
            className="btn-bauhaus font-mono text-xs uppercase tracking-widest font-black px-4 py-2 bg-[#F0C020] text-black border-2 border-black shadow-[3px_3px_0px_0px_black] hover:bg-black hover:text-white self-start sm:self-auto transition-all"
          >
            VIEW ALL {plan.tasks.length} DIRECTIVES →
          </button>
        </div>

        <div className="divide-y-2 divide-black">
          {upcomingTasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className="py-4 flex items-start sm:items-center justify-between gap-4 group hover:bg-[#FFF9C4]/40 transition-colors p-2"
              >
                <div className="flex items-start gap-4">
                  {/* Square Checkbox Button */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 w-6 h-6 border-2 border-black flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? "bg-[#D02020] text-white shadow-[2px_2px_0px_0px_black]"
                        : "bg-white hover:bg-[#F0C020] shadow-[2px_2px_0px_0px_black]"
                    }`}
                    aria-label={`Mark directive '${task.title}' as complete`}
                  >
                    {isDone && <Check size={16} strokeWidth={3} />}
                  </button>

                  <div className="space-y-1">
                    <h3
                      className={`text-sm sm:text-base font-black uppercase tracking-tight ${
                        isDone ? "line-through text-black/40" : "text-black"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-black/70 font-medium line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span
                    className={`px-2.5 py-1 uppercase tracking-wider font-black border-2 border-black shadow-[2px_2px_0px_0px_black] ${
                      task.priority === "urgent"
                        ? "bg-[#D02020] text-white"
                        : task.priority === "high"
                        ? "bg-[#F0C020] text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="font-bold text-black uppercase">
                    DUE {task.dueDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
