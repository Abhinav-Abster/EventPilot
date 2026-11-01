"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { calculateBudgetSummary, optimizeBudget } from "../../lib/budget/budgetEngine";
import { formatINR, rupeesToPaise, subtractMoney } from "../../lib/budget/moneyUtils";
import { BudgetItem } from "../../lib/types/event";
import { BudgetMetricsHeader } from "./parts/BudgetMetricsHeader";
import { BudgetWarningsCard } from "./parts/BudgetWarningsCard";
import { BudgetOptimizerBanner } from "./parts/BudgetOptimizerBanner";
import { BudgetCategoryFilter } from "./parts/BudgetCategoryFilter";
import { BudgetTable } from "./parts/BudgetTable";
import { BudgetItemAddModal } from "./parts/BudgetItemAddModal";
import { BudgetItemEditModal } from "./parts/BudgetItemEditModal";
import { useBudgetForm } from "./hooks/useBudgetForm";

/**
 * Primary budget dashboard providing financial breakdown, optimizer actions, and category summaries.
 */
export function BudgetStudioView() {
  const { plan, addBudgetItem, updateBudgetItem, deleteBudgetItem, setActiveProposal } = usePlan();

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

  const handleEditItem = useCallback((item: BudgetItem) => setEditingItem(item), []);
  const handleDeleteItem = useCallback((id: string) => deleteBudgetItem(id), [deleteBudgetItem]);

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
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-hard-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-3.5 h-3.5 rounded-none bg-bauhausBlue border-2 border-black inline-block" />
            <span>MODULE 02 / CAPITAL EXPENDITURE & AUDIT</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
            BUDGET STUDIO
          </h1>
          <p className="font-medium text-sm text-bauhausBlack max-w-2xl leading-relaxed">
            Deterministic minor-unit integer arithmetic prevents precision drift. Every category
            constraint is strictly verified against event mandates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-bauhaus px-6 py-4 bg-bauhausRed hover:bg-bauhausRed/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-hard-4 flex items-center gap-2 shrink-0"
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

      <BudgetCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalItemsCount={plan.budgetItems.length}
        summary={summary}
      />

      <BudgetTable items={filteredItems} onEdit={handleEditItem} onDelete={handleDeleteItem} />

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
