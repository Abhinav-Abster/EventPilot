import { useState } from "react";
import { BudgetCategory } from "../../../lib/types/event";

export interface BudgetFormData {
  name: string;
  category: BudgetCategory;
  estimatedRupees: string;
  actualRupees: string;
  flexible: boolean;
  isProtected: boolean;
  notes: string;
}

export function useBudgetForm() {
  const [form, setForm] = useState<BudgetFormData>({
    name: "",
    category: "food_beverage",
    estimatedRupees: "",
    actualRupees: "",
    flexible: true,
    isProtected: false,
    notes: "",
  });

  const setName = (name: string) => setForm((prev) => ({ ...prev, name }));
  const setCategory = (category: BudgetCategory) => setForm((prev) => ({ ...prev, category }));
  const setEstimatedRupees = (estimatedRupees: string) =>
    setForm((prev) => ({ ...prev, estimatedRupees }));
  const setActualRupees = (actualRupees: string) => setForm((prev) => ({ ...prev, actualRupees }));
  const setFlexible = (flexible: boolean) => setForm((prev) => ({ ...prev, flexible }));
  const setIsProtected = (isProtected: boolean) => setForm((prev) => ({ ...prev, isProtected }));
  const setNotes = (notes: string) => setForm((prev) => ({ ...prev, notes }));

  const resetForm = () => {
    setForm({
      name: "",
      category: "food_beverage",
      estimatedRupees: "",
      actualRupees: "",
      flexible: true,
      isProtected: false,
      notes: "",
    });
  };

  return {
    form,
    setName,
    setCategory,
    setEstimatedRupees,
    setActualRupees,
    setFlexible,
    setIsProtected,
    setNotes,
    resetForm,
  };
}
