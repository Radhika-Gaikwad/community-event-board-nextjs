"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCard, { EventCardSkeleton } from "./EventCard";
import Pagination from "./Pagination";
import { EmptyState, ErrorState } from "./States";

export default function FeedBrowser() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/feed?page=${page}&limit=6`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load your feed.");
        setData(result);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err instanceof TypeError ? "Network error. Check your connection and try again." : err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, reloadKey]);

  if (loading && !data) {
    return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <EventCardSkeleton key={index} />)}</div>;
  }
  if (error && !data) return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />;
  if (!data?.categories.length) {
    return <EmptyState title="Your feed starts with your interests" message="Choose a few event categories and we’ll gather upcoming plans for you.">
      <Link href="/preferences" className="inline-flex min-h-10 items-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900">Choose categories</Link>
    </EmptyState>;
  }
  if (!data.items.length) {
    return <EmptyState title="Nothing on your calendar just yet" message={`There are no upcoming ${data.categories.join(" or ")} events right now. Check back soon or update your interests.`}>
      <Link href="/preferences" className="text-sm font-semibold text-emerald-800 hover:underline">Update interests</Link>
    </EmptyState>;
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-600">Upcoming in {data.categories.join(", ")} <span className="text-slate-400">·</span> {data.total} {data.total === 1 ? "event" : "events"}</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  );
}