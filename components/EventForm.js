"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

const inputClass =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function FieldLabel({ htmlFor, required = false, children }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}{required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
    </label>
  );
}

export default function EventForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    city: "",
    startsAt: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // The date input has no timezone. The browser knows the user's timezone,
    // so we convert to a full ISO time here before sending.
    const when = new Date(form.startsAt);
    if (Number.isNaN(when.getTime())) {
      setError("Please pick a valid date and time");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, startsAt: when.toISOString() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not save the event");
        return;
      }
      router.push(`/admin?created=${encodeURIComponent(json.event.title)}&sort=createdAt&order=desc&page=1&limit=5`);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <p className="text-sm font-semibold text-slate-800">Event details</p>
          <p className="mt-1 text-xs text-slate-500"><span className="text-red-600">*</span> Required fields</p>
        </div>

        <div className="grid gap-x-8 gap-y-7 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-7" aria-labelledby="event-basics-heading">
            <h2 id="event-basics-heading" className="text-xs font-bold uppercase tracking-wide text-emerald-800">Basics</h2>
            <div>
              <FieldLabel htmlFor="title" required>Event title</FieldLabel>
              <input id="title" required maxLength={120} value={form.title} onChange={update("title")} className={inputClass} placeholder="e.g. Riverside Music Night" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="category" required>Category</FieldLabel>
                <select id="category" required value={form.category} onChange={update("category")} className={inputClass}>
                  {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="city" required>City</FieldLabel>
                <input id="city" required maxLength={60} value={form.city} onChange={update("city")} className={inputClass} placeholder="e.g. Coimbatore" />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-5 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-labelledby="event-schedule-heading">
            <h2 id="event-schedule-heading" className="text-xs font-bold uppercase tracking-wide text-emerald-800">Schedule and price</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="startsAt" required>Date and time</FieldLabel>
                <input id="startsAt" type="datetime-local" required value={form.startsAt} onChange={update("startsAt")} className={inputClass} />
              </div>
              <div>
                <FieldLabel htmlFor="price" required>Price (INR)</FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input id="price" type="number" required min="0" step="1" placeholder="0 for free" value={form.price} onChange={update("price")} className={`${inputClass} pl-8`} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Enter 0 for a free event.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-5 lg:col-span-7" aria-labelledby="event-description-heading">
            <h2 id="event-description-heading" className="text-xs font-bold uppercase tracking-wide text-emerald-800">Description</h2>
            <div>
              <FieldLabel htmlFor="description" required>Description</FieldLabel>
              <textarea id="description" required rows={7} maxLength={2000} value={form.description} onChange={update("description")} className={`${inputClass} min-h-40 resize-y`} placeholder="What should visitors know before they go?" />
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-5 lg:col-span-5 lg:border-l lg:pl-8" aria-labelledby="event-image-heading">
            <h2 id="event-image-heading" className="text-xs font-bold uppercase tracking-wide text-emerald-800">Event image</h2>
            <div>
              <FieldLabel htmlFor="imageUrl" required>Image URL</FieldLabel>
              <input id="imageUrl" type="url" required placeholder="https://example.com/event-image.jpg" value={form.imageUrl} onChange={update("imageUrl")} className={inputClass} />
              <p className="mt-1 text-xs text-slate-500">Use a direct image link ending in a supported image file or image URL.</p>
            </div>
          </section>

          {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-800 lg:col-span-12">{error}</p>}
        </div>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
        <button type="button" onClick={() => router.push("/admin")} className="min-h-10 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="min-h-10 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
          {saving ? "Saving event..." : "Save event"}
        </button>
      </div>
    </form>
  );
}