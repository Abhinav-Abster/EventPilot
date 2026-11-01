import React from "react";
import { Wallet, CheckSquare, Building } from "lucide-react";
import { BudgetSummary } from "../../../lib/types/event";
import { formatINR } from "../../../lib/budget/moneyUtils";
import { NavTab } from "../../layout/Navbar";

interface DashboardArchitecturalCardsProps {
  budgetSummary: BudgetSummary;
  percentSpent: number;
  completedTasksCount: number;
  totalTasksCount: number;
  overdueTasksCount: number;
  blockedTasksCount: number;
  vendorsCount: number;
  bookedVendorsCount: number;
  venueCity: string;
  totalVendorQuotesMinor: number;
  vendorSectorCount: number;
  onNavigate: (tab: NavTab) => void;
}

export function DashboardArchitecturalCards({
  budgetSummary,
  percentSpent,
  completedTasksCount,
  totalTasksCount,
  overdueTasksCount,
  blockedTasksCount,
  vendorsCount,
  bookedVendorsCount,
  venueCity,
  totalVendorQuotesMinor,
  vendorSectorCount,
  onNavigate,
}: DashboardArchitecturalCardsProps) {
  const tasksPercent = Math.round((completedTasksCount / (totalTasksCount || 1)) * 100);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Card 1: Budget Ledger */}
      <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-hard-8 flex flex-col justify-between relative">
        <span
          className="w-4 h-4 rounded-full bg-bauhausRed border-2 border-black absolute top-4 right-4"
          title="Circle Accent"
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-black pb-3">
            <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
              <Wallet size={18} strokeWidth={2.5} className="text-bauhausRed" />
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

          <div className="w-full border-2 border-black h-4 bg-bauhausCanvas p-0.5">
            <div
              className="h-full bg-bauhausRed transition-all duration-300"
              style={{ width: `${Math.min(100, percentSpent)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">REMAINING</span>
            <span className="font-black text-black text-sm">
              {formatINR(budgetSummary.remainingEstimatedMinor)}
            </span>
          </div>
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">CONTINGENCY</span>
            <span className="font-black text-black text-sm">
              {budgetSummary.contingencyPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Execution Directives */}
      <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-hard-8 flex flex-col justify-between relative">
        <span
          className="w-4 h-4 rounded-none bg-bauhausBlue border-2 border-black absolute top-4 right-4"
          title="Square Accent"
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-black pb-3">
            <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
              <CheckSquare size={18} strokeWidth={2.5} className="text-bauhausBlue" />
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
              {completedTasksCount} / {totalTasksCount}
            </div>
            <div className="font-mono text-xs font-bold text-black/60 pt-1">
              {tasksPercent}% COMPLETE
            </div>
          </div>

          <div className="w-full border-2 border-black h-4 bg-bauhausCanvas p-0.5">
            <div
              className="h-full bg-bauhausBlue transition-all duration-300"
              style={{ width: `${tasksPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">OVERDUE</span>
            <span className="font-black text-bauhausRed text-sm">
              {overdueTasksCount} DIRECTIVES
            </span>
          </div>
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">BLOCKED</span>
            <span className="font-black text-black text-sm">{blockedTasksCount} DIRECTIVES</span>
          </div>
        </div>
      </div>

      {/* Card 3: Vendor Roster */}
      <div className="card-bauhaus bg-white border-4 border-black p-8 shadow-hard-8 flex flex-col justify-between relative">
        <span
          className="w-4 h-4 shape-triangle bg-bauhausYellow border-b-2 border-black absolute top-4 right-4"
          title="Triangle Accent"
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-black pb-3">
            <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider font-black text-black">
              <Building size={18} strokeWidth={2.5} className="text-bauhausYellow" />
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
              {vendorsCount} CONTRACTS
            </div>
            <div className="font-mono text-xs font-bold text-black/60 pt-1">
              {bookedVendorsCount} CONFIRMED BOOKINGS
            </div>
          </div>

          <div className="p-2 border-2 border-black bg-bauhausLightYellow text-tiny font-black uppercase tracking-wider">
            PRIMARY VENUE: {venueCity}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black text-xs font-mono mt-6">
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">TOTAL QUOTES</span>
            <span className="font-black text-black text-sm">
              {formatINR(totalVendorQuotesMinor)}
            </span>
          </div>
          <div>
            <span className="text-black/60 block text-micro uppercase font-bold">COVERAGE</span>
            <span className="font-black text-black text-sm">{vendorSectorCount} SECTORS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
