"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function SiteHeader() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => (res.ok ? (await res.json()).user : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-bold text-emerald-900 sm:text-lg">
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden="true" />
          Community Events Board
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
          {user ? (
            <>
              <Link href="/feed" className="text-slate-700 hover:text-emerald-800">My Feed</Link>
              <Link href="/preferences" className="hidden text-slate-700 hover:text-emerald-800 min-[420px]:inline">Preferences</Link>
              <LogoutButton />
            </>
          ) : checked ? (
            <>
              <Link href="/login" className="text-slate-700 hover:text-emerald-800">Log in</Link>
              <Link href="/signup" className="rounded-md bg-emerald-800 px-3 py-2 text-white hover:bg-emerald-900">Sign up</Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}