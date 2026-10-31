"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  X,
  ArrowRight,
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

      {/* 4 Architectural Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
          <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-black absolute top-4 right-4" />
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
              01 / TOTAL CEILING
            </span>
            <span className="font-display font-black text-3xl text-black block">
              {formatINR(summary.totalBudgetMinor)}
            </span>
          </div>
          <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
            MANDATED UPPER BOUND
          </span>
        </div>

        <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
          <span className="w-4 h-4 rounded-none bg-[#1040C0] border-2 border-black absolute top-4 right-4" />
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
              02 / ESTIMATED COMMIT
            </span>
            <span
              className={`font-display font-black text-3xl block ${
                summary.isOverspent ? "text-[#D02020]" : "text-black"
              }`}
            >
              {formatINR(summary.totalEstimatedMinor)}
            </span>
          </div>
          <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
            SUM OF {plan.budgetItems.length} ITEMS
          </span>
        </div>

        <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
          <span className="w-4 h-4 shape-triangle bg-[#F0C020] border-b-2 border-black absolute top-4 right-4" />
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
              03 / BUFFER REMAINING
            </span>
            <span
              className={`font-display font-black text-3xl block ${
                summary.remainingEstimatedMinor >= 0
                  ? "text-black"
                  : "text-[#D02020]"
              }`}
            >
              {formatINR(summary.remainingEstimatedMinor)}
            </span>
          </div>
          <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
            {summary.isOverspent ? "OVERRUN DEFICIT" : "UNCOMMITTED CAPITAL"}
          </span>
        </div>

        <div className="card-bauhaus bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] flex flex-col justify-between relative">
          <span className="w-4 h-4 bg-black rotate-45 border border-black absolute top-4 right-4" />
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest font-black text-black/60 block mb-2">
              04 / CONTINGENCY
            </span>
            <span className="font-display font-black text-3xl text-black block">
              {formatINR(summary.contingencyMinor)}
            </span>
          </div>
          <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider mt-4 pt-3 border-t-2 border-black block">
            {summary.contingencyPercent}% HEDGE RESERVE
          </span>
        </div>
      </div>

      {/* Warnings & Infeasibility Notices */}
      {summary.warnings.length > 0 && (
        <div className="border-4 border-black p-6 bg-[#D02020] text-white shadow-[6px_6px_0px_0px_black] space-y-3">
          <div className="flex items-center gap-3 border-b-2 border-white pb-2">
            <AlertCircle size={20} strokeWidth={2.5} className="text-white shrink-0" />
            <h2 className="font-mono uppercase tracking-widest text-xs font-black text-white">
              FINANCIAL AUDIT DISCREPANCIES ({summary.warnings.length})
            </h2>
          </div>
          <ul className="space-y-1 text-xs font-bold font-mono text-white">
            {summary.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>[!]</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4px Heavy Divider */}
      <div className="w-full border-t-4 border-black" />

      {/* Budget Optimization Simulation Terminal (Bauhaus Yellow) */}
      <div className="bg-[#F0C020] text-black border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-widest font-black text-black">
            <Sparkles size={16} strokeWidth={2.5} />
            <span>ALGORITHMIC SPEND OPTIMIZER</span>
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
            DETERMINISTIC REDUCTION SOLVER
          </h2>
          <p className="text-sm font-medium text-black/90 leading-relaxed">
            Specify a target cap to simulate structured reductions. The deterministic engine protects non-negotiable items (e.g. pure vegetarian catering, core themes) while scaling flexible allocations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <span className="absolute left-3 top-3 text-black font-mono text-xs font-black">
              ₹
            </span>
            <input
              type="number"
              step="1000"
              value={targetOptimizationRupees}
              onChange={(e) => setTargetOptimizationRupees(e.target.value)}
              className="pl-8 pr-4 py-3 w-full sm:w-36 bg-white border-4 border-black text-xs font-mono font-black text-black shadow-[3px_3px_0px_0px_black] focus:outline-none"
              placeholder="30000"
            />
          </div>
          <button
            onClick={handleSimulateOptimization}
            className="btn-bauhaus w-full sm:w-auto px-6 py-3.5 bg-[#1040C0] hover:bg-[#1040C0]/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-[4px_4px_0px_0px_black] shrink-0 flex items-center justify-center gap-2"
          >
            <span>SIMULATE CUTS</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

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
                <tr key={item.id} className="hover:bg-[#FFF9C4]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-display font-black text-sm uppercase text-black">{item.name}</div>
                    {item.notes && (
                      <div className="font-sans text-xs text-black/70 mt-0.5 font-medium">
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="border-2 border-black bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_black]">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-black text-sm">
                    {formatINR(item.estimatedCostMinor)}
                  </td>
                  <td className="py-4 px-4 text-black font-bold">
                    {item.actualCostMinor > 0 ? formatINR(item.actualCostMinor) : "—"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.isProtected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#D02020] text-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_black]">
                          <ShieldCheck size={12} strokeWidth={2.5} />
                          PROTECTED
                        </span>
                      ) : item.flexible ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider border border-black bg-white px-2 py-0.5 text-black">
                          FLEXIBLE
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#1040C0] text-white border border-black px-2 py-0.5">
                          FIXED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 border-2 border-black bg-white hover:bg-[#F0C020] text-black shadow-[2px_2px_0px_0px_black] transition-all"
                        title="Edit Item"
                      >
                        <Edit2 size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => deleteBudgetItem(item.id)}
                        className="p-1.5 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white text-black shadow-[2px_2px_0px_0px_black] transition-all"
                        title="Delete Item"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#F0C020] border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
                ADD CUSTOM EXPENSE
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  ITEM DESCRIPTION
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return gift snack boxes"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    CATEGORY
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    {ALL_BUDGET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    ESTIMATED (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2500"
                    value={newItemEstimatedRupees}
                    onChange={(e) => setNewItemEstimatedRupees(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 font-black uppercase tracking-wider text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemFlexible}
                    onChange={(e) => setNewItemFlexible(e.target.checked)}
                    className="w-4 h-4 border-2 border-black accent-[#D02020]"
                  />
                  <span>FLEXIBLE CUTS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemProtected}
                    onChange={(e) => setNewItemProtected(e.target.checked)}
                    className="w-4 h-4 border-2 border-black accent-[#D02020]"
                  />
                  <span>PROTECTED MUST-HAVE</span>
                </label>
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  NOTES
                </label>
                <input
                  type="text"
                  placeholder="Optional supplier context"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-bauhaus px-6 py-2 bg-[#D02020] text-white hover:bg-[#D02020]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
                >
                  REGISTER ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#1040C0] text-white border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
                EDIT EXPENSE ITEM
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 border-2 border-white bg-white text-black hover:bg-[#D02020] hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  ITEM NAME
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    ESTIMATED (₹)
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
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    ACTUAL SPENT (₹)
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
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 font-black uppercase tracking-wider text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.flexible}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, flexible: e.target.checked })
                    }
                    className="w-4 h-4 border-2 border-black accent-[#D02020]"
                  />
                  <span>FLEXIBLE CUTS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isProtected)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isProtected: e.target.checked })
                    }
                    className="w-4 h-4 border-2 border-black accent-[#D02020]"
                  />
                  <span>PROTECTED REQUIREMENT</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-bauhaus px-6 py-2 bg-[#1040C0] text-white hover:bg-[#1040C0]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
                >
                  COMMIT CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
