import Link from "next/link";
import EventsBrowser from "@/components/EventsBrowser";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-indigo-700">
            Community Events Board
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-slate-700 hover:text-indigo-700">Log in</Link>
            <Link href="/signup" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">Sign up</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Upcoming events</h1>
        <p className="mb-6 mt-1 text-slate-600">Find music nights, workshops, food fairs and more near you.</p>
        <EventsBrowser />
      </main>
    </div>
  );
}