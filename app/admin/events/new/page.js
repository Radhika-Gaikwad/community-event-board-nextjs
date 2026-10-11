import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import EventForm from "@/components/EventForm";

export const metadata = { title: "Add event · Admin" };

export default function NewEventPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-emerald-50/40">
      <AdminHeader />
      <main className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <Link href="/admin" className="mb-3 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to events
        </Link>
        <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin</p>
        <h1 className="mb-4 mt-1 shrink-0 text-2xl font-bold text-slate-900">Add an event</h1>
        <EventForm />
      </main>
    </div>
  );
}