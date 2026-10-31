"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { VendorRecord, VendorBookingStatus } from "../../lib/types/event";
import { rupeesToPaise } from "../../lib/budget/moneyUtils";
import { VendorCard } from "./VendorCard";
import { VendorCategoryFilter } from "./parts/VendorCategoryFilter";
import { VendorAddModal, NewVendorFormData } from "./parts/VendorAddModal";
import { VendorEditModal } from "./parts/VendorEditModal";

const INITIAL_VENDOR_FORM: NewVendorFormData = {
  name: "",
  category: "caterer",
  contactPerson: "",
  phone: "",
  email: "",
  estimatedQuote: "",
  bookingStatus: "planned",
  paymentStatus: "unpaid",
  notes: "",
};

export function VendorManagementView() {
  const { plan, addVendor, updateVendor, deleteVendor } = usePlan();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [vendorForm, setVendorForm] = useState<NewVendorFormData>(INITIAL_VENDOR_FORM);

  const filteredVendors = useMemo(
    () => (selectedCategory === "all" ? plan.vendors : plan.vendors.filter((v) => v.category === selectedCategory)),
    [plan.vendors, selectedCategory]
  );

  const handleStatusChange = useCallback(
    (id: string, status: VendorBookingStatus) => {
      updateVendor(id, { bookingStatus: status });
    },
    [updateVendor]
  );

  const handleEditVendor = useCallback((vendor: VendorRecord) => {
    setEditingVendor(vendor);
  }, []);

  const handleDeleteVendor = useCallback(
    (id: string) => {
      deleteVendor(id);
    },
    [deleteVendor]
  );

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;

    addVendor({
      name: vendorForm.name.trim(),
      category: vendorForm.category,
      contact: {
        contactPerson: vendorForm.contactPerson,
        phone: vendorForm.phone,
        email: vendorForm.email,
      },
      estimatedQuoteMinor: rupeesToPaise(parseFloat(vendorForm.estimatedQuote) || 0),
      actualQuoteMinor: rupeesToPaise(parseFloat(vendorForm.estimatedQuote) || 0),
      bookingStatus: vendorForm.bookingStatus,
      paymentStatus: vendorForm.paymentStatus,
      notes: vendorForm.notes,
      relatedTaskIds: [],
    });

    setShowAddModal(false);
    setVendorForm(INITIAL_VENDOR_FORM);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    updateVendor(editingVendor.id, {
      name: editingVendor.name,
      category: editingVendor.category,
      contact: editingVendor.contact,
      estimatedQuoteMinor: editingVendor.estimatedQuoteMinor,
      actualQuoteMinor: editingVendor.actualQuoteMinor,
      bookingStatus: editingVendor.bookingStatus,
      paymentStatus: editingVendor.paymentStatus,
      notes: editingVendor.notes,
    });

    setEditingVendor(null);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Bauhaus Header */}
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-3.5 h-3.5 bg-[#F0C020] border-2 border-black inline-block" />
            <span>MODULE 04 / SERVICE ROSTER & PROCUREMENT</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
            VENDOR DIRECTORY
          </h1>
          <p className="font-medium text-sm text-[#121212] max-w-2xl leading-relaxed">
            Curated index of verified suppliers, caterers, decorators, and venues. Track contractual quotations and execution commitments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-bauhaus px-6 py-4 bg-[#D02020] hover:bg-[#D02020]/90 text-white text-xs font-mono uppercase tracking-widest font-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>ENROLL VENDOR</span>
        </button>
      </div>

      {/* Transparent Disclosure */}
      <div className="bg-[#FFF9C4] border-4 border-black p-5 shadow-[4px_4px_0px_0px_black] text-xs font-mono text-black flex items-start gap-3">
        <AlertCircle size={18} strokeWidth={2.5} className="text-[#D02020] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="uppercase font-black">BENCHMARK DISCLOSURE:</strong> Initial vendor profiles reflect market calibrations for Pune venues and services. EventPilot conducts verified deterministic constraint scoring for quotes and timelines.
        </span>
      </div>

      <VendorCategoryFilter
        vendors={plan.vendors}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="w-full border-t-4 border-black" />

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredVendors.map((vendor, idx) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            index={idx}
            onStatusChange={handleStatusChange}
            onEdit={handleEditVendor}
            onDelete={handleDeleteVendor}
          />
        ))}
      </div>

      <VendorAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={vendorForm}
        onChange={setVendorForm}
        onSubmit={handleCreateVendor}
      />

      <VendorEditModal
        editingVendor={editingVendor}
        onClose={() => setEditingVendor(null)}
        onSubmit={handleSaveEdit}
        onChange={setEditingVendor}
      />
    </div>
  );
}
