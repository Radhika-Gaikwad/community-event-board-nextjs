import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import FeedBrowser from "@/components/FeedBrowser";

export const metadata = { title: "My Feed · Community Events Board" };

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Picked for you</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My Feed</h1>
            <p className="mt-2 text-sm text-slate-600">Upcoming events from the categories you follow.</p>
          </div>
          <Link href="/preferences" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
            <SlidersHorizontal size={16} aria-hidden="true" /> Edit interests
          </Link>
        </div>
        <FeedBrowser />
      </main>
    </div>
  );
}