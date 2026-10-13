"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { formatEventDate, formatPrice } from "@/lib/format";
import ReminderButton from "./ReminderButton";
import { ErrorState, Spinner } from "./States";

export default function EventDetails({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/events/${eventId}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load this event.");
        setEvent(data.event);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err instanceof TypeError ? "Network error. Check your connection and try again." : err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [eventId]);

  if (loading) return <Spinner label="Loading event..." />;
  if (error || !event) return <ErrorState message={error || "Event not found."} onRetry={() => window.location.reload()} />;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative h-56 bg-emerald-100 sm:h-80">
        {event.imageUrl && <Image src={event.imageUrl} alt={event.title} fill unoptimized sizes="(max-width: 640px) 100vw, 1152px" className="object-cover" />}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-900">{event.category}</span>
      </div>
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline"><ArrowLeft size={16} /> All events</Link>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <p className="inline-flex items-center gap-2"><CalendarDays size={17} className="text-emerald-700" />{formatEventDate(event.startsAt)}</p>
            <p className="inline-flex items-center gap-2"><MapPin size={17} className="text-emerald-700" />{event.city}</p>
          </div>
          <section className="mt-7 max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-900">About this event</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{event.description}</p>
          </section>
        </div>
        <aside className="h-fit rounded-lg border border-emerald-100 bg-emerald-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admission</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(event.price)}</p>
          <div className="mt-5 border-t border-emerald-100 pt-5"><ReminderButton eventId={event.id} /></div>
        </aside>
      </div>
    </article>
  );
}