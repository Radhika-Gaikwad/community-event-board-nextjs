"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function SiteNavigation({ isSignedIn }) {
  const pathname = usePathname();
  const activeClass = "rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-emerald-900";

  return (
    <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
      {isSignedIn ? (
        <>
          <Link href="/feed" aria-current={pathname === "/feed" ? "page" : undefined} className={pathname === "/feed" ? activeClass : "text-slate-700 hover:text-emerald-800"}>My Feed</Link>
          <Link href="/preferences" aria-current={pathname === "/preferences" ? "page" : undefined} className={`hidden min-[420px]:inline ${pathname === "/preferences" ? activeClass : "text-slate-700 hover:text-emerald-800"}`}>Preferences</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login" className="text-slate-700 hover:text-emerald-800">Log in</Link>
          <Link href="/signup" className="rounded-md bg-emerald-800 px-3 py-2 text-white hover:bg-emerald-900">Sign up</Link>
        </>
      )}
    </nav>
  );
}