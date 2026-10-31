"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import {
  calculateBudgetSummary,
  ALL_BUDGET_CATEGORIES,
  CATEGORY_LABELS,
  optimizeBudget,
} from "../../lib/budget/budgetEngine";
import {
  formatINR,
  rupeesToPaise,
  subtractMoney,
} from "../../lib/budget/moneyUtils";
import { BudgetItem } from "../../lib/types/event";
import { BudgetItemRow } from "./BudgetItemRow";
import { BudgetMetricsHeader } from "./parts/BudgetMetricsHeader";
import { BudgetWarningsCard } from "./parts/BudgetWarningsCard";
import { BudgetOptimizerBanner } from "./parts/BudgetOptimizerBanner";
import { BudgetItemAddModal } from "./parts/BudgetItemAddModal";
import { BudgetItemEditModal } from "./parts/BudgetItemEditModal";
import { useBudgetForm } from "./hooks/useBudgetForm";

export function BudgetStudioView() {
  const {
    plan,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    setActiveProposal,
  } = usePlan();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [targetOptimizationRupees, setTargetOptimizationRupees] = useState("30000");

  const {
    form,
    setName,
    setCategory,
    setEstimatedRupees,
    setFlexible,
    setIsProtected,
    setNotes,
    resetForm,
  } = useBudgetForm();

  const summary = useMemo(
    () =>
      calculateBudgetSummary(
        plan.profile.totalBudgetMinor,
        plan.budgetItems,
        plan.profile.guestCount
      ),
    [plan.profile.totalBudgetMinor, plan.budgetItems, plan.profile.guestCount]
  );

  const filteredItems = useMemo(
    () =>
      selectedCategory === "all"
        ? plan.budgetItems
        : plan.budgetItems.filter((i) => i.category === selectedCategory),
    [plan.budgetItems, selectedCategory]
  );

  const handleEditItem = useCallback((item: BudgetItem) => {
    setEditingItem(item);
  }, []);

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteBudgetItem(id);
    },
    [deleteBudgetItem]
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    addBudgetItem({
      name: form.name.trim(),
      category: form.category,
      estimatedCostMinor: rupeesToPaise(parseFloat(form.estimatedRupees) || 0),
      actualCostMinor: rupeesToPaise(parseFloat(form.actualRupees) || 0),
      flexible: form.flexible,
      isProtected: form.isProtected,
      notes: form.notes,
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateBudgetItem(editingItem.id, {
      name: editingItem.name,
      category: editingItem.category,
      estimatedCostMinor: editingItem.estimatedCostMinor,
      actualCostMinor: editingItem.actualCostMinor,
      flexible: editingItem.flexible,
      isProtected: editingItem.isProtected,
      notes: editingItem.notes,
    });

    setEditingItem(null);
  };

  const handleSimulateOptimization = () => {
    const targetMinor = rupeesToPaise(parseFloat(targetOptimizationRupees) || 30000);
    const optResult = optimizeBudget(plan.budgetItems, targetMinor, plan.profile);

    setActiveProposal({
      id: "prop-budget-sim",
      title: `OPTIMIZED BUDGET FOR ${formatINR(targetMinor)}`,
      summary: optResult.explanation,
      strategy: "cost_reduction",
      impact: {
        budgetDeltaMinor: subtractMoney(targetMinor, plan.profile.totalBudgetMinor),
        newTotalEstimatedMinor: optResult.newEstimatedMinor,
        tasksAffectedCount: optResult.modifications.length,
        feasibilityScore: optResult.isFeasible ? 95 : 60,
        preservedConstraints: optResult.unviolatedMustHaves,
        unresolvedIssues: optResult.conflicts,
      },
      diffs: [
        {
          type: "profile",
          field: "totalBudgetMinor",
          label: "Total Budget",
          before: formatINR(plan.profile.totalBudgetMinor),
          after: formatINR(targetMinor),
          impactReason: `User triggered budget optimization to target ${formatINR(targetMinor)}.`,
        },
        ...optResult.modifications.map((m) => ({
          type: "budget" as const,
          field: m.itemId,
          label: m.name,
          before: formatINR(m.beforeMinor),
          after: formatINR(m.afterMinor),
          impactReason: m.reason,
        })),
      ],
      revisedPlan: {
        ...plan,
        profile: { ...plan.profile, totalBudgetMinor: targetMinor },
        budgetItems: optResult.optimizedItems,
        updatedAt: new Date().toISOString(),
        version: plan.version + 1,
      },
    });
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Bauhaus Header */}
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-3.5 h-3.5 rounded-none bg-[#1040C0] border-2 border-black inline-block" />
            <span>MODULE 02 / CAPITAL EXPENDITURE & AUDIT</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
            BUDGET STUDIO
          </h1>
          <p className="font-medium text-sm text-[#121212] max-w-2xl leading-relaxed">
            Deterministic minor-unit integer arithmetic prevents precision drift. Every category constraint is strictly verified against event mandates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-bauhaus px-6 py-4 bg-[#D02020] hover:bg-[#D02020]/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>ADD EXPENSE LINE</span>
        </button>
      </div>

      <BudgetMetricsHeader summary={summary} itemsCount={plan.budgetItems.length} />

      <BudgetWarningsCard warnings={summary.warnings} />

      <div className="w-full border-t-4 border-black" />

      <BudgetOptimizerBanner
        targetOptimizationRupees={targetOptimizationRupees}
        setTargetOptimizationRupees={setTargetOptimizationRupees}
        onSimulate={handleSimulateOptimization}
      />

      {/* Category Breakdown Filter Tabs */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
          CATEGORY LEDGERS:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
                : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
            }`}
          >
            ALL ITEMS ({plan.budgetItems.length})
          </button>
          {ALL_BUDGET_CATEGORIES.map((catKey) => {
            const catInfo = summary.categoryBreakdown[catKey];
            if (catInfo.count === 0) return null;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
                    : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
                }`}
              >
                {CATEGORY_LABELS[catKey]} ({formatINR(catInfo.estimatedMinor)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#121212] text-white uppercase text-[11px] tracking-widest border-b-4 border-black">
              <tr>
                <th className="py-4 px-6 font-black">EXPENSE ITEM</th>
                <th className="py-4 px-4 font-black">CATEGORY</th>
                <th className="py-4 px-4 font-black">ESTIMATED</th>
                <th className="py-4 px-4 font-black">ACTUAL</th>
                <th className="py-4 px-4 font-black">STATUS</th>
                <th className="py-4 px-6 text-right font-black">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-black">
              {filteredItems.map((item) => (
                <BudgetItemRow
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BudgetItemAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={form}
        setName={setName}
        setCategory={setCategory}
        setEstimatedRupees={setEstimatedRupees}
        setFlexible={setFlexible}
        setIsProtected={setIsProtected}
        setNotes={setNotes}
        onSubmit={handleCreateItem}
      />

      <BudgetItemEditModal
        editingItem={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        onChange={setEditingItem}
      />
    </div>
  );
}
