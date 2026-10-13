import SiteHeader from "@/components/SiteHeader";
import EventDetails from "@/components/EventDetails";

export const metadata = { title: "Event details · Community Events Board" };

export default async function EventPage({ params }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-9">
        <EventDetails eventId={id} />
      </main>
    </div>
  );
}