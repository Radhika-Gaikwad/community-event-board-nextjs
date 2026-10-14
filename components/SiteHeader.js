import { cookies } from "next/headers";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";
import SiteNavigation from "./SiteNavigation";

export default async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-bold text-emerald-900 sm:text-lg">
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden="true" />
          Community Events Board
        </Link>
        <SiteNavigation isSignedIn={Boolean(user)} />
      </div>
    </header>
  );
}