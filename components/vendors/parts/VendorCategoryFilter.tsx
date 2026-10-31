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
              ? "bg-[#D02020] text-white font-black shadow-[4px_4px_0px_0px_black]"
              : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_black] hover:bg-[#F0C020]"
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
  );
}
