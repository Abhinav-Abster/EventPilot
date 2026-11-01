import React from "react";
import { VendorRecord } from "../../../lib/types/event";
import { VENDOR_CATEGORY_LABELS } from "../../../lib/vendor/vendorEngine";

interface VendorCategoryFilterProps {
  vendors: VendorRecord[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function VendorCategoryFilter({
  vendors,
  selectedCategory,
  onSelectCategory,
}: VendorCategoryFilterProps) {
  return (
    <div className="space-y-3">
      <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
        DISCIPLINE FILTERS:
      </span>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onSelectCategory("all")}
          className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
            selectedCategory === "all"
              ? "bg-bauhausRed text-white font-black shadow-hard-4"
              : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
          }`}
        >
          ALL CATEGORIES ({vendors.length})
        </button>
        {Object.entries(VENDOR_CATEGORY_LABELS).map(([catKey, label]) => {
          const count = vendors.filter((v) => v.category === catKey).length;
          if (count === 0) return null;
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
                selectedCategory === catKey
                  ? "bg-bauhausRed text-white font-black shadow-hard-4"
                  : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
              }`}
            >
              {label.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
