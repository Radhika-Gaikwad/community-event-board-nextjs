import Link from "next/link";
import { Plus } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import AdminEvents from "@/components/AdminEvents";

export const metadata = { title: "Manage events · Admin" };

export default function AdminPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-emerald-50/40">
      <AdminHeader />
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-4 sm:py-6">
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Manage events</h1>
            <p className="mt-1 text-sm text-slate-600">Inactive events are hidden from visitors. Events are never deleted.</p>
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add event
          </Link>
        </div>
        <AdminEvents />
      </main>
    </div>
  );
}