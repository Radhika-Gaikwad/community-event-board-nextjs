import Link from "next/link";
import { CalendarDays } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <Link href="/admin" className="inline-flex min-w-0 items-center gap-1.5 text-sm font-bold text-emerald-800 sm:gap-2 sm:text-lg">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
          <span className="truncate">Community Events Board</span>
        </Link>
        <nav aria-label="Admin navigation" className="flex shrink-0 items-center gap-2 text-sm font-medium sm:gap-3">
          <Link href="/" className="hidden text-slate-700 hover:text-emerald-700 min-[420px]:inline">Browse events</Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}