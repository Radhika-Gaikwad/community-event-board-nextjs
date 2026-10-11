"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowDownUp, ArrowUp, Search } from "lucide-react";
import { formatEventDate, formatPrice } from "@/lib/format";
import Pagination from "./Pagination";
import { EmptyState, ErrorState, Spinner } from "./States";

const SORT_COLUMNS = [
  ["title", "Event"],
  ["category", "Category"],
  ["city", "City"],
  ["startsAt", "Date"],
  ["createdAt", "Added"],
  ["price", "Price"],
  ["status", "Status"],
];

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") ?? "",
    status: ["active", "inactive"].includes(params.get("status")) ? params.get("status") : "all",
    sort: SORT_COLUMNS.some(([key]) => key === params.get("sort")) ? params.get("sort") : "createdAt",
    order: params.get("order") === "asc" ? "asc" : "desc",
    page: Math.max(1, Number.parseInt(params.get("page"), 10) || 1),
    limit: [5, 10, 20].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 5,
  };
}

export default function AdminEvents() {
  const [query, setQuery] = useState({ q: "", status: "all", sort: "createdAt", order: "desc", page: 1, limit: 5 });
  const [searchValue, setSearchValue] = useState("");
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const syncFromUrl = () => {
      const nextQuery = readQuery();
      setQuery(nextQuery);
      setSearchValue(nextQuery.q);
      const createdTitle = new URLSearchParams(window.location.search).get("created");
      setToast(createdTitle ? `${createdTitle} was added successfully.` : "");
    };
    syncFromUrl();
    setInitialized(true);
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const q = searchValue.trim();
      setQuery((current) => current.q === q ? current : { ...current, q, page: 1 });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams({
      status: query.status,
      sort: query.sort,
      order: query.order,
      page: String(query.page),
      limit: String(query.limit),
    });
    if (query.q.trim()) params.set("q", query.q.trim());
    window.history.replaceState(null, "", `/admin?${params.toString()}`);
  }, [initialized, query]);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      status: query.status,
      sort: query.sort,
      order: query.order,
      page: String(query.page),
      limit: String(query.limit),
    });
    if (query.q.trim()) params.set("q", query.q.trim());

    try {
      const res = await fetch(`/api/admin/events?${params}`, { signal });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load events");
      setEvents(json.events);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err instanceof TypeError ? "Network error. Please check your connection." : err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!initialized) return undefined;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [initialized, load, reloadKey]);

  function updateQuery(changes) {
    setQuery((current) => ({ ...current, ...changes }));
  }

  function sortBy(field) {
    const order = query.sort === field && query.order === "asc" ? "desc" : "asc";
    updateQuery({ sort: field, order, page: 1 });
  }

  async function toggle(event) {
    setBusyId(event.id);
    setActionError("");
    try {
      const res = await fetch(`/api/events/${event.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !event.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not update the event");
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err instanceof TypeError ? "Network error. Please try again." : err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!initialized || (loading && events.length === 0 && !error)) return <Spinner label="Loading events..." />;
  if (error && events.length === 0) return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />;

  const rangeStart = total === 0 ? 0 : (query.page - 1) * query.limit + 1;
  const rangeEnd = Math.min(query.page * query.limit, total);

  return (
    <section aria-label="Admin event list" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}

      {toast && <div className="admin-toast" role="status">{toast}</div>}

      <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search title, category, city, or description"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="whitespace-nowrap">Status</span>
          <select
            value={query.status}
            onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}
            className="min-h-10 min-w-32 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
      {!error && total === 0 ? (
        <EmptyState
          title={query.q || query.status !== "all" ? "No events match these filters" : "No events yet"}
          message={query.q || query.status !== "all" ? "Try changing your search or status filter." : "Add your first event using the button above."}
        />
      ) : !error && (
        <>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
              <p>{total} {total === 1 ? "event" : "events"}</p>
              <label className="flex items-center gap-2">
                <span>Rows</span>
                <select
                  value={query.limit}
                  onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  aria-label="Rows per page"
                >
                  {[5, 10, 20].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-emerald-50 text-xs uppercase tracking-wide text-emerald-900">
                  <tr>
                    {SORT_COLUMNS.map(([field, label]) => (
                      <th
                        key={field}
                        scope="col"
                        aria-sort={query.sort === field ? (query.order === "asc" ? "ascending" : "descending") : "none"}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        <button onClick={() => sortBy(field)} className="inline-flex items-center gap-1.5 hover:text-emerald-700">
                          {label}
                          {query.sort === field
                            ? query.order === "asc" ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />
                            : <ArrowDownUp size={14} className="opacity-40" aria-hidden="true" />}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
                  {events.map((event) => {
                    const isPast = new Date(event.startsAt) < new Date();
                    return (
                      <tr key={event.id} className="hover:bg-emerald-50/70">
                        <td className="max-w-64 px-4 py-2.5">
                          <p className="truncate font-semibold text-slate-900">{event.title}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{event.description}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{event.category}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{event.city}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                          {formatEventDate(event.startsAt)}
                          {isPast && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Past</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{formatEventDate(event.createdAt)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{formatPrice(event.price)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                            {event.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <button
                            onClick={() => toggle(event)}
                            disabled={busyId === event.id}
                            className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
                          >
                            {busyId === event.id ? "Saving..." : event.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-col items-center justify-between gap-2 sm:flex-row">
              <p className="text-xs text-slate-500">Showing {rangeStart}–{rangeEnd} of {total}</p>
              <Pagination page={query.page} totalPages={totalPages} onChange={(page) => updateQuery({ page })} className="mt-0" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}