"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  Mail,
  Building,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  CreditCard,
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-forest-900">
            Vendor Directory & Quote Tracker
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track quotes, contracts, and payment statuses across verified service providers in Pune.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-900 hover:bg-forest-850 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Transparent Disclosure */}
      <div className="bg-sand-50 border border-sand-300 rounded-2xl p-4 text-xs text-stone-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <span>
          <strong>Sample Data Disclosure:</strong> All initial vendor entries represent realistic Pune service benchmarks. EventPilot does not claim to make real-world financial transactions or reservations without verified integration credentials.
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            selectedCategory === "all"
              ? "bg-forest-900 text-white font-semibold"
              : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
          }`}
        >
          All Categories ({plan.vendors.length})
        </button>
        {Object.entries(VENDOR_CATEGORY_LABELS).map(([catKey, label]) => {
          const count = plan.vendors.filter((v) => v.category === catKey).length;
          if (count === 0) return null;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                selectedCategory === catKey
                  ? "bg-forest-900 text-white font-semibold"
                  : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVendors.map((vendor) => {
          const statusInfo =
            BOOKING_STATUS_CONFIG[vendor.bookingStatus] ||
            BOOKING_STATUS_CONFIG.planned;

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl p-6 border border-sand-200 hover:border-sand-300 shadow-xs hover:shadow-sm transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-stone-400 block mb-0.5">
                    {VENDOR_CATEGORY_LABELS[vendor.category]}
                  </span>
                  <h3 className="text-base font-bold text-forest-900">
                    {vendor.name}
                  </h3>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusInfo.badgeBg} ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Quotes & Payment Status */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-sand-50 rounded-xl text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px]">Quote Amount</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {formatINR(vendor.estimatedQuoteMinor)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Payment Status</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {vendor.paymentStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                {vendor.contact.contactPerson && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span>{vendor.contact.contactPerson}</span>
                  </div>
                )}
                {vendor.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span className="font-mono">{vendor.contact.phone}</span>
                  </div>
                )}
                {vendor.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span>{vendor.contact.email}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {vendor.notes && (
                <p className="text-xs text-stone-500 bg-sand-50/50 p-2.5 rounded-lg border border-sand-100">
                  {vendor.notes}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-sand-100">
                <div className="flex items-center gap-2">
                  <select
                    value={vendor.bookingStatus}
                    onChange={(e) =>
                      updateVendor(vendor.id, {
                        bookingStatus: e.target.value as VendorBookingStatus,
                      })
                    }
                    className="text-xs bg-white border border-sand-300 rounded-lg px-2 py-1 text-stone-700"
                  >
                    <option value="planned">Planned</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingVendor(vendor)}
                    className="p-1.5 text-stone-400 hover:text-forest-900 hover:bg-sand-100 rounded-lg transition"
                    title="Edit Vendor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Add New Vendor
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Anime Decor Studio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Quote (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newEstimatedQuote}
                    onChange={(e) => setNewEstimatedQuote(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Mr. Rajesh"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98220..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="vendor@pune.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Services covered, terms, or cancellation clauses"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sand-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Edit Vendor Details
              </h3>
              <button
                onClick={() => setEditingVendor(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingVendor.name}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Quote (₹)
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
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Booking Status
                  </label>
                  <select
                    value={editingVendor.bookingStatus}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        bookingStatus: e.target.value as VendorBookingStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingVendor.notes}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white font-semibold rounded-lg"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
