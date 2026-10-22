"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  PieChart,
  CheckCircle2,
  X,
  Sliders,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import {
  calculateBudgetSummary,
  ALL_BUDGET_CATEGORIES,
  CATEGORY_LABELS,
  optimizeBudget,
} from "../../lib/budget/budgetEngine";
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  addMoney,
  subtractMoney,
} from "../../lib/budget/moneyUtils";
import { BudgetItem, BudgetCategory } from "../../lib/types/event";

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

  // New Item Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<BudgetCategory>("food_beverage");
  const [newItemEstimatedRupees, setNewItemEstimatedRupees] = useState("");
  const [newItemActualRupees, setNewItemActualRupees] = useState("");
  const [newItemFlexible, setNewItemFlexible] = useState(true);
  const [newItemProtected, setNewItemProtected] = useState(false);
  const [newItemNotes, setNewItemNotes] = useState("");

  // Optimization simulation state
  const [targetOptimizationRupees, setTargetOptimizationRupees] = useState("30000");

  const summary = calculateBudgetSummary(
    plan.profile.totalBudgetMinor,
    plan.budgetItems,
    plan.profile.guestCount
  );

  const filteredItems =
    selectedCategory === "all"
      ? plan.budgetItems
      : plan.budgetItems.filter((i) => i.category === selectedCategory);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addBudgetItem({
      name: newItemName.trim(),
      category: newItemCategory,
      estimatedCostMinor: rupeesToPaise(parseFloat(newItemEstimatedRupees) || 0),
      actualCostMinor: rupeesToPaise(parseFloat(newItemActualRupees) || 0),
      flexible: newItemFlexible,
      isProtected: newItemProtected,
      notes: newItemNotes,
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

  const resetForm = () => {
    setNewItemName("");
    setNewItemCategory("food_beverage");
    setNewItemEstimatedRupees("");
    setNewItemActualRupees("");
    setNewItemFlexible(true);
    setNewItemProtected(false);
    setNewItemNotes("");
  };

  const handleSimulateOptimization = () => {
    const targetMinor = rupeesToPaise(parseFloat(targetOptimizationRupees) || 30000);
    const optResult = optimizeBudget(plan.budgetItems, targetMinor, plan.profile);

    setActiveProposal({
      id: "prop-budget-sim",
      title: `Optimized Budget Plan for ${formatINR(targetMinor)}`,
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-forest-900">
            Deterministic Budget Studio
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Integer minor-unit arithmetic prevents floating point rounding errors. All totals update reactively.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-900 hover:bg-forest-850 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add Custom Expense</span>
        </button>
      </div>

      {/* Financial Health Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 block mb-1">
            Total Allocated Budget
          </span>
          <span className="text-2xl font-bold font-display text-forest-900 block">
            {formatINR(summary.totalBudgetMinor)}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Mandated ceiling limit
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 block mb-1">
            Total Estimated Spend
          </span>
          <span
            className={`text-2xl font-bold font-display block ${
              summary.isOverspent ? "text-rose-700" : "text-stone-900"
            }`}
          >
            {formatINR(summary.totalEstimatedMinor)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Sum of {plan.budgetItems.length} planned items
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 block mb-1">
            Remaining Buffer
          </span>
          <span
            className={`text-2xl font-bold font-display block ${
              summary.remainingEstimatedMinor >= 0
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {formatINR(summary.remainingEstimatedMinor)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {summary.isOverspent ? "Deficit detected" : "Unallocated cushion"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 block mb-1">
            Contingency Reserve
          </span>
          <span className="text-2xl font-bold font-display text-stone-900 block">
            {formatINR(summary.contingencyMinor)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {summary.contingencyPercent}% of total event budget
          </span>
        </div>
      </div>

      {/* Warnings & Infeasibility Notices */}
      {summary.warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold">Financial Feasibility Warnings:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {summary.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Budget Optimization Trigger Panel */}
      <div className="bg-sand-50 border border-sand-300 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>Smart Budget Optimization Engine</span>
          </div>
          <p className="text-xs text-stone-600 max-w-xl">
            Simulate a budget reduction. The optimizer trims flexible items and non-critical categories while strictly safeguarding protected requirements like 100% vegetarian catering and milestone themes.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-stone-400 text-xs font-mono">
              ₹
            </span>
            <input
              type="number"
              step="1000"
              value={targetOptimizationRupees}
              onChange={(e) => setTargetOptimizationRupees(e.target.value)}
              className="pl-7 pr-3 py-2 w-32 bg-white border border-sand-300 rounded-xl text-xs font-mono font-bold text-stone-900"
              placeholder="30000"
            />
          </div>
          <button
            onClick={handleSimulateOptimization}
            className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white rounded-xl text-xs font-semibold shadow-sm transition shrink-0"
          >
            Optimize Budget →
          </button>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            selectedCategory === "all"
              ? "bg-forest-900 text-white"
              : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
          }`}
        >
          All Items ({plan.budgetItems.length})
        </button>
        {ALL_BUDGET_CATEGORIES.map((catKey) => {
          const catInfo = summary.categoryBreakdown[catKey];
          if (catInfo.count === 0) return null;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                selectedCategory === catKey
                  ? "bg-forest-900 text-white"
                  : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
              }`}
            >
              {CATEGORY_LABELS[catKey]} ({formatINR(catInfo.estimatedMinor)})
            </button>
          );
        })}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-sand-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-stone-600 border-b border-sand-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Expense Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Estimated (₹)</th>
                <th className="py-3.5 px-4">Actual (₹)</th>
                <th className="py-3.5 px-4">Status / Protection</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100 text-stone-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-sand-50/60 transition">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-stone-900">{item.name}</div>
                    {item.notes && (
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 bg-sand-100 text-stone-700 rounded text-[11px]">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold text-stone-900">
                    {formatINR(item.estimatedCostMinor)}
                  </td>
                  <td className="py-4 px-4 font-mono text-stone-700">
                    {item.actualCostMinor > 0 ? formatINR(item.actualCostMinor) : "—"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.isProtected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Protected
                        </span>
                      ) : item.flexible ? (
                        <span className="text-[10px] text-stone-500 bg-sand-100 px-2 py-0.5 rounded-full">
                          Flexible
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-600 bg-sand-200 px-2 py-0.5 rounded-full">
                          Fixed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-stone-500 hover:text-forest-900 hover:bg-sand-100 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudgetItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Add Custom Budget Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return gift snack boxes"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    {ALL_BUDGET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2500"
                    value={newItemEstimatedRupees}
                    onChange={(e) => setNewItemEstimatedRupees(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemFlexible}
                    onChange={(e) => setNewItemFlexible(e.target.checked)}
                    className="rounded text-forest-900 focus:ring-forest-900"
                  />
                  <span>Flexible for cuts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemProtected}
                    onChange={(e) => setNewItemProtected(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>Protect as Must-Have</span>
                </label>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional context or supplier details"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white font-semibold rounded-lg"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Edit Budget Item
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Estimated (₹)
                  </label>
                  <input
                    type="number"
                    value={paiseToRupees(editingItem.estimatedCostMinor)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        estimatedCostMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Actual Spent (₹)
                  </label>
                  <input
                    type="number"
                    value={paiseToRupees(editingItem.actualCostMinor)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        actualCostMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.flexible}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, flexible: e.target.checked })
                    }
                    className="rounded text-forest-900 focus:ring-forest-900"
                  />
                  <span>Flexible for cuts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isProtected)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isProtected: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>Protected Requirement</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white font-semibold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
