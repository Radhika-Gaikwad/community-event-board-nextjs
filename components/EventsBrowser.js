"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import EventCard, { EventCardSkeleton } from "./EventCard";
import Pagination from "./Pagination";
import { EmptyState, ErrorState } from "./States";

export default function EventsBrowser() {
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [q, setQ] = useState(""); // what is typed in the box
  const [debouncedQ, setDebouncedQ] = useState(""); // what we actually search for
  const [page, setPage] = useState(1);

  const [cities, setCities] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Load the city dropdown once
  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((json) => setCities(json.cities ?? []))
      .catch(() => { }); // the dropdown just stays empty, the list still works
  }, []);

  // Wait until the user stops typing for 400 ms, then search from page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  // Fetch whenever a filter or the page changes
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (category) params.set("category", category);
        if (city) params.set("city", city);
        if (debouncedQ) params.set("q", debouncedQ);

        const res = await fetch(`/api/events?${params}`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load events");
        setData(json);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return; // a newer request replaced this one
        setError(err instanceof TypeError ? "Network error. Please check your connection." : err.message);
        setLoading(false);
      }
    }

    load();
    return () => controller.abort(); // cancel the old request so it can't overwrite a newer one
  }, [category, city, debouncedQ, page, reloadKey]);

  function changeCategory(value) {
    setCategory(value);
    setPage(1);
  }

  function changeCity(value) {
    setCity(value);
    setPage(1);
  }

  function clearFilters() {
    setCategory("");
    setCity("");
    setQ("");
    setDebouncedQ("");
    setPage(1);
  }

  function goToPage(next) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = Boolean(category || city || q);

  const chipClass = (active) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${active
      ? "border-emerald-800 bg-emerald-800 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
    }`;

  return (
    <section>
      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, e.g. night"
            aria-label="Search events"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {["", ...CATEGORIES].map((c) => (
              <button key={c || "all"} onClick={() => changeCategory(c)} aria-pressed={category === c} className={chipClass(category === c)}>
                {c || "All"}
              </button>
            ))}
          </div>

          <select
            value={city}
            onChange={(e) => changeCity(e.target.value)}
            aria-label="Filter by city"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : data.items.length === 0 ? (
          hasFilters ? (
            <EmptyState title="No events match your filters" message="Try a different category or city, or search for something else.">
              <button onClick={clearFilters} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <EmptyState title="No upcoming events yet" message="New events are added regularly. Please check back soon!" />
          )
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {data.total} {data.total === 1 ? "event" : "events"} found
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </section>
  );
}