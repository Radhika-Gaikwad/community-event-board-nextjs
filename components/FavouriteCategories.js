"use client";

import { useEffect, useState } from "react";
import { Check, Heart, LoaderCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { ErrorState, Spinner } from "./States";

const categoryNotes = {
  Music: "Live sets, listening rooms and nights out.",
  Workshop: "Learn a skill or make something by hand.",
  Food: "Markets, tastings and tables worth sharing.",
  Sports: "Get moving, join a team or cheer from the side.",
  Kids: "Hands-on plans for curious young minds.",
};

export default function FavouriteCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/favourites", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your preferences.");
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Check your connection and try again." : err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggle(category) {
    setMessage("");
    setCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/favourites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your preferences.");
      setCategories(data.categories);
      setMessage("Your favourites are saved.");
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Your changes were not saved." : err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading preferences..." />;
  if (error && categories.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="max-w-4xl">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800"><Heart size={19} aria-hidden="true" /></span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your interests</h2>
          <p className="mt-1 text-sm text-slate-600">Choose what you enjoy. Your feed will show upcoming events in these categories.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const selected = categories.includes(category);
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(category)}
              className={`flex min-h-28 items-start justify-between rounded-lg border p-4 text-left transition ${selected ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"}`}
            >
              <span>
                <span className="block font-semibold text-slate-900">{category}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{categoryNotes[category]}</span>
              </span>
              <span className={`ml-3 grid h-5 w-5 shrink-0 place-items-center rounded border ${selected ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white text-transparent"}`}>
                <Check size={13} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      {error && <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm font-medium text-emerald-800">{message}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {saving ? "Saving..." : "Save preferences"}
        </button>
        <span className="text-xs text-slate-500">{categories.length} selected</span>
      </div>
    </section>
  );
}