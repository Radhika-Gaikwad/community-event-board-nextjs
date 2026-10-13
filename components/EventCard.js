"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { formatEventDate, formatPrice } from "@/lib/format";

export default function EventCard({ event }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-video bg-indigo-50">
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"; // broken link: show the plain background
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900"><Link href={`/events/${event.id}`} className="hover:text-emerald-800">{event.title}</Link></h3>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          {formatEventDate(event.startsAt)}
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          {event.city}
        </p>
        <p className="mt-auto pt-2 text-base font-bold text-slate-900">{formatPrice(event.price)}</p>
      </div>
    </article>
  );
}

// Grey placeholder shown while events load
export function EventCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-hidden="true">
      <div className="aspect-video bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}