"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const buttonClass =
  "inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({ page, totalPages, onChange, className = "mt-8" }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`${className} flex items-center justify-center gap-4`}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={buttonClass}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={buttonClass}>
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}