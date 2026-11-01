import React from "react";
import { formatINR } from "../../../lib/budget/moneyUtils";
import { EventPlan } from "../../../lib/types/event";

interface DashboardMetricGaugesProps {
  plan: EventPlan;
  percentSpent: number;
}

export function DashboardMetricGauges({ plan, percentSpent }: DashboardMetricGaugesProps) {
  return (
    <section className="bg-bauhausYellow text-black border-4 border-black p-6 sm:p-10 shadow-hard-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 bg-black inline-block" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-black">
            METRIC CONSTRUCT & TEMPORAL DISCIPLINE
          </h2>
        </div>
        <span className="font-mono text-xs font-black uppercase tracking-widest bg-white text-black border-2 border-black px-3 py-1 shadow-hard-2">
          4 SYNCHRONIZED GAUGES
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Target Date */}
        <div className="bg-white border-4 border-black p-5 shadow-hard-4 space-y-2 relative">
          <span className="w-3.5 h-3.5 rounded-full bg-bauhausRed border-2 border-black absolute top-3 right-3" />
          <span className="font-mono text-micro uppercase tracking-widest font-black text-black/60 block">
            01 / COMMENCEMENT
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl text-black">
            {plan.profile.date}
          </div>
          <div className="font-mono text-xs font-bold text-black/80">{plan.profile.time} HRS</div>
        </div>

        {/* Stat 2: Location */}
        <div className="bg-white border-4 border-black p-5 shadow-hard-4 space-y-2 relative">
          <span className="w-3.5 h-3.5 rounded-none bg-bauhausBlue border-2 border-black absolute top-3 right-3" />
          <span className="font-mono text-micro uppercase tracking-widest font-black text-black/60 block">
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
        <div className="bg-white border-4 border-black p-5 shadow-hard-4 space-y-2 relative">
          <span className="w-3.5 h-3.5 shape-triangle bg-bauhausYellow border-b-2 border-black absolute top-3 right-3" />
          <span className="font-mono text-micro uppercase tracking-widest font-black text-black/60 block">
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
        <div className="bg-white border-4 border-black p-5 shadow-hard-4 space-y-2 relative">
          <span className="w-3.5 h-3.5 bg-black rotate-45 border border-black absolute top-3 right-3" />
          <span className="font-mono text-micro uppercase tracking-widest font-black text-black/60 block">
            04 / TOTAL BUDGET
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl text-black">
            {formatINR(plan.profile.totalBudgetMinor)}
          </div>
          <div className="font-mono text-xs font-bold text-bauhausRed uppercase">
            {percentSpent}% COMMITTED
          </div>
        </div>
      </div>
    </section>
  );
}
