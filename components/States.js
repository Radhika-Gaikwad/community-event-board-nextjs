import { CalendarX2, TriangleAlert } from "lucide-react";

export function Spinner({ label = "Loading..." }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-700" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, message, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <CalendarX2 className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-slate-600">{message}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <TriangleAlert className="h-10 w-10 text-red-500" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-red-800">Something went wrong</h2>
      <p className="mt-1 max-w-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Try again
        </button>
      )}
    </div>
  );
}