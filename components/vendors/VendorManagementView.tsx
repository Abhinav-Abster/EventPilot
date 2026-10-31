"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import {
  VendorRecord,
  VendorCategory,
  VendorBookingStatus,
  VendorPaymentStatus,
} from "../../lib/types/event";
import {
  VENDOR_CATEGORY_LABELS,
  BOOKING_STATUS_CONFIG,
} from "../../lib/vendor/vendorEngine";
import { formatINR, paiseToRupees, rupeesToPaise } from "../../lib/budget/moneyUtils";

export function VendorManagementView() {
  const { plan, addVendor, updateVendor, deleteVendor } = usePlan();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);

  // New Vendor Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<VendorCategory>("caterer");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEstimatedQuote, setNewEstimatedQuote] = useState("");
  const [newBookingStatus, setNewBookingStatus] =
    useState<VendorBookingStatus>("planned");
  const [newPaymentStatus, setNewPaymentStatus] =
    useState<VendorPaymentStatus>("unpaid");
  const [newNotes, setNewNotes] = useState("");

  const filteredVendors =
    selectedCategory === "all"
      ? plan.vendors
      : plan.vendors.filter((v) => v.category === selectedCategory);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addVendor({
      name: newName.trim(),
      category: newCategory,
      contact: {
        contactPerson: newContactPerson,
        phone: newPhone,
        email: newEmail,
      },
      estimatedQuoteMinor: rupeesToPaise(parseFloat(newEstimatedQuote) || 0),
      actualQuoteMinor: rupeesToPaise(parseFloat(newEstimatedQuote) || 0),
      bookingStatus: newBookingStatus,
      paymentStatus: newPaymentStatus,
      notes: newNotes,
      relatedTaskIds: [],
    });

    setShowAddModal(false);
    resetForm();
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

  const resetForm = () => {
    setNewName("");
    setNewCategory("caterer");
    setNewContactPerson("");
    setNewPhone("");
    setNewEmail("");
    setNewEstimatedQuote("");
    setNewBookingStatus("planned");
    setNewPaymentStatus("unpaid");
    setNewNotes("");
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

      {/* Category Filter Tabs */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
          DISCIPLINE FILTERS:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
                : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
            }`}
          >
            ALL CATEGORIES ({plan.vendors.length})
          </button>
          {Object.entries(VENDOR_CATEGORY_LABELS).map(([catKey, label]) => {
            const count = plan.vendors.filter((v) => v.category === catKey).length;
            if (count === 0) return null;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
                  selectedCategory === catKey
                    ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
                    : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
                }`}
              >
                {label.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4px Heavy Divider */}
      <div className="w-full border-t-4 border-black" />

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredVendors.map((vendor, idx) => {
          const statusInfo =
            BOOKING_STATUS_CONFIG[vendor.bookingStatus] ||
            BOOKING_STATUS_CONFIG.planned;

          // Alternate corner accents
          const cornerShape =
            idx % 3 === 0
              ? "rounded-full bg-[#D02020]"
              : idx % 3 === 1
              ? "rounded-none bg-[#1040C0]"
              : "shape-triangle bg-[#F0C020]";

          return (
            <div
              key={vendor.id}
              className="card-bauhaus bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between space-y-6 relative"
            >
              <span className={`w-4 h-4 ${cornerShape} border-2 border-black absolute top-4 right-4`} />

              <div className="space-y-4">
                <div className="border-b-4 border-black pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-black text-black/60 block mb-1">
                    {VENDOR_CATEGORY_LABELS[vendor.category]}
                  </span>
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
                    {vendor.name}
                  </h2>
                </div>

                {/* Quotes & Payment Status */}
                <div className="grid grid-cols-2 gap-4 p-4 border-2 border-black bg-[#F0F0F0] shadow-[3px_3px_0px_0px_black] font-mono text-xs">
                  <div>
                    <span className="text-black/60 block text-[10px] uppercase font-bold tracking-wider">
                      CONTRACT QUOTE
                    </span>
                    <span className="font-black text-black text-lg block pt-0.5">
                      {formatINR(vendor.estimatedQuoteMinor)}
                    </span>
                  </div>
                  <div>
                    <span className="text-black/60 block text-[10px] uppercase font-bold tracking-wider">
                      PAYMENT STATUS
                    </span>
                    <span className="font-black text-black uppercase block pt-1">
                      {vendor.paymentStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 text-xs font-mono text-black pt-1">
                  {vendor.contact.contactPerson && (
                    <div className="flex items-center gap-2">
                      <Users size={15} strokeWidth={2.5} className="text-[#D02020] shrink-0" />
                      <span className="font-bold">{vendor.contact.contactPerson}</span>
                    </div>
                  )}
                  {vendor.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={15} strokeWidth={2.5} className="text-[#1040C0] shrink-0" />
                      <span className="font-bold">{vendor.contact.phone}</span>
                    </div>
                  )}
                  {vendor.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={15} strokeWidth={2.5} className="text-[#F0C020] shrink-0" />
                      <span className="font-bold">{vendor.contact.email}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="text-xs text-black/80 font-medium bg-[#FFF9C4] p-3 border-2 border-black shadow-[2px_2px_0px_0px_black]">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t-4 border-black">
                <div>
                  <select
                    value={vendor.bookingStatus}
                    onChange={(e) =>
                      updateVendor(vendor.id, {
                        bookingStatus: e.target.value as VendorBookingStatus,
                      })
                    }
                    className="text-xs font-mono font-black uppercase bg-[#F0F0F0] border-2 border-black px-3 py-1.5 text-black shadow-[2px_2px_0px_0px_black] focus:outline-none"
                  >
                    <option value="planned">PLANNED</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="quote_received">QUOTE RECEIVED</option>
                    <option value="shortlisted">SHORTLISTED</option>
                    <option value="booked">BOOKED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingVendor(vendor)}
                    className="p-2 border-2 border-black bg-white hover:bg-[#F0C020] text-black shadow-[2px_2px_0px_0px_black] transition-all"
                    title="Edit Vendor"
                  >
                    <Edit2 size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-2 border-2 border-black bg-white hover:bg-[#D02020] hover:text-white text-black shadow-[2px_2px_0px_0px_black] transition-all"
                    title="Delete Vendor"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#D02020] text-white border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
                ENROLL SERVICE VENDOR
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  VENDOR / ESTABLISHMENT NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Anime Decor Studio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    DISCIPLINE
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    QUOTE (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newEstimatedQuote}
                    onChange={(e) => setNewEstimatedQuote(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    CONTACT PERSON
                  </label>
                  <input
                    type="text"
                    placeholder="Mr. Rajesh"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    PHONE
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98220..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  EMAIL
                </label>
                <input
                  type="email"
                  placeholder="vendor@pune.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  TERMS & NOTES
                </label>
                <textarea
                  rows={2}
                  placeholder="Deliverables covered, deposit terms, cancellation policies..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  ENROLL VENDOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_black] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-[#1040C0] text-white border-b-4 border-black">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
                EDIT VENDOR CONTRACT
              </h2>
              <button
                onClick={() => setEditingVendor(null)}
                className="p-1 border-2 border-white bg-white text-black hover:bg-[#D02020] hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  NAME
                </label>
                <input
                  type="text"
                  required
                  value={editingVendor.name}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    QUOTE (₹)
                  </label>
                  <input
                    type="number"
                    value={paiseToRupees(editingVendor.estimatedQuoteMinor)}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        estimatedQuoteMinor: rupeesToPaise(
                          parseFloat(e.target.value) || 0
                        ),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  />
                </div>
                <div>
                  <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                    BOOKING STATUS
                  </label>
                  <select
                    value={editingVendor.bookingStatus}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        bookingStatus: e.target.value as VendorBookingStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                  >
                    <option value="planned">PLANNED</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="quote_received">QUOTE RECEIVED</option>
                    <option value="shortlisted">SHORTLISTED</option>
                    <option value="booked">BOOKED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase tracking-wider mb-1 text-[11px]">
                  NOTES
                </label>
                <textarea
                  rows={2}
                  value={editingVendor.notes}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="btn-bauhaus px-4 py-2 border-2 border-black bg-white hover:bg-[#F0F0F0] text-black uppercase tracking-wider font-bold shadow-[2px_2px_0px_0px_black]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-bauhaus px-6 py-2 bg-[#1040C0] text-white hover:bg-[#1040C0]/90 border-2 border-black uppercase tracking-widest font-black shadow-[3px_3px_0px_0px_black]"
                >
                  SAVE SPECIFICATIONS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
