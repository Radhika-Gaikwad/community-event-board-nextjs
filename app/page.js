import SiteHeader from "@/components/SiteHeader";
import EventsBrowser from "@/components/EventsBrowser";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Upcoming events</h1>
        <p className="mb-6 mt-1 text-slate-600">Find music nights, workshops, food fairs and more near you.</p>
        <EventsBrowser />
      </main>
    </div>
  );
}