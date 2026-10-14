"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, LoaderCircle, Save, Sparkles, X } from "lucide-react";
import { formatEventDate } from "@/lib/format";
import { CARD_STICKERS, CARD_THEMES, DEFAULT_CARD_DESIGN } from "@/lib/card-design";
import { ErrorState, Spinner } from "./States";

const STICKER_POSITIONS = ["card-sticker-slot-0", "card-sticker-slot-1", "card-sticker-slot-2"];

export default function CardDesigner({ event }) {
  const [theme, setTheme] = useState(DEFAULT_CARD_DESIGN.theme);
  const [stickers, setStickers] = useState(DEFAULT_CARD_DESIGN.stickers);
  const [savedDesign, setSavedDesign] = useState(DEFAULT_CARD_DESIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDesign = useCallback(async () => {
    setLoading(true);
    setError("");
    setRequiresLogin(false);
    try {
      const response = await fetch(`/api/events/${event.id}/card`, { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) {
        setRequiresLogin(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || "Could not load your card design.");
      setTheme(data.design.theme);
      setStickers(data.design.stickers);
      setSavedDesign(data.design);
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Try loading your design again." : err.message);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => { loadDesign(); }, [loadDesign]);

  const hasChanges = theme !== savedDesign.theme || stickers.join("|") !== savedDesign.stickers.join("|");

  function toggleSticker(stickerId) {
    setMessage("");
    setStickers((current) => {
      if (current.includes(stickerId)) return current.filter((item) => item !== stickerId);
      if (current.length >= 3) return current;
      return [...current, stickerId];
    });
  }

  async function saveDesign() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/events/${event.id}/card`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, stickers }),
      });
      const data = await response.json();
      if (response.status === 401) {
        setRequiresLogin(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || "Could not save your card design.");
      setSavedDesign(data.design);
      setMessage("Card design saved.");
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Your design was not saved." : err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"><Spinner label="Loading your card design..." /></section>;
  if (error && !savedDesign) return <section className="mt-8"><ErrorState message={error} onRetry={loadDesign} /></section>;

  return (
    <section className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8" aria-labelledby="card-designer-title">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800"><Sparkles size={19} aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Make it yours</p>
            <h2 id="card-designer-title" className="mt-1 text-xl font-bold text-slate-900">Design your event card</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a look, add up to three stickers, and save it for this event.</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasChanges ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
          {hasChanges ? "Unsaved changes" : "Saved"}
        </span>
      </div>

      {requiresLogin ? (
        <div className="rounded-md border border-emerald-100 bg-emerald-50/60 p-5 text-sm text-slate-700">
          Sign in to save a card design for this event. <Link href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`} className="font-semibold text-emerald-800 underline">Log in</Link>
        </div>
      ) : (
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className={`card-preview card-preview-${theme} relative isolate aspect-[1.35/1] min-h-64 overflow-hidden rounded-md sm:min-h-80`} aria-live="polite">
            {event.imageUrl && <Image src={event.imageUrl} alt="" fill unoptimized sizes="(max-width: 1024px) 100vw, 760px" className="card-preview-image" />}
            <div className="card-preview-wash" />
            <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">Around · Community events</span>
                <span className="rounded-full border border-current/20 bg-white/20 px-2.5 py-1 text-xs font-semibold">{event.category}</span>
              </div>
              <div className="max-w-[78%]">
                <p className="mb-2 text-xs font-semibold opacity-80">{event.city}</p>
                <h3 className="text-2xl font-bold leading-tight sm:text-4xl">{event.title}</h3>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-current/20 pt-3 text-xs font-semibold sm:text-sm">
                <span>{formatEventDate(event.startsAt)}</span>
                <span>{event.price === 0 ? "Free entry" : `₹${new Intl.NumberFormat("en-IN").format(event.price)}`}</span>
              </div>
            </div>
            {stickers.map((stickerId, index) => {
              const sticker = CARD_STICKERS.find((item) => item.id === stickerId);
              return (
                <button
                  key={stickerId}
                  type="button"
                  title={`Remove ${sticker.label}`}
                  aria-label={`Remove ${sticker.label} sticker`}
                  onClick={() => toggleSticker(stickerId)}
                  className={`card-sticker ${STICKER_POSITIONS[index]}`}
                >
                  <span>{sticker.emoji}</span><X size={12} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-800">Background theme</legend>
              <div role="radiogroup" aria-label="Background theme" className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((cardTheme) => (
                  <button
                    key={cardTheme.id}
                    type="button"
                    role="radio"
                    aria-checked={theme === cardTheme.id}
                    onClick={() => { setTheme(cardTheme.id); setMessage(""); }}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-md border text-xs font-semibold transition ${theme === cardTheme.id ? "border-emerald-700 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}`}
                  >
                    <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: cardTheme.swatch }} />
                    {cardTheme.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-slate-800">Stickers <span className="font-normal text-slate-500">({stickers.length}/3)</span></legend>
              <p className="mb-3 text-xs text-slate-500">Tap to add or remove. Select a sticker on the preview to remove it.</p>
              <div className="flex flex-wrap gap-2">
                {CARD_STICKERS.map((sticker) => {
                  const selected = stickers.includes(sticker.id);
                  const atLimit = stickers.length >= 3 && !selected;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${selected ? "Remove" : "Add"} ${sticker.label} sticker`}
                      title={sticker.label}
                      disabled={atLimit}
                      onClick={() => toggleSticker(sticker.id)}
                      className={`grid h-11 w-11 place-items-center rounded-md border text-xl transition ${selected ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {sticker.emoji}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
            {message && <p role="status" className="text-sm font-medium text-emerald-800">{message}</p>}
            <button type="button" onClick={saveDesign} disabled={saving || !hasChanges} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
              {saving ? "Saving card..." : "Save design"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}