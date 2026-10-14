"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, LoaderCircle } from "lucide-react";

export default function ReminderButton({ eventId }) {
  const [isReminded, setIsReminded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReminder = useCallback(async () => {
    setLoading(true);
    setError("");
    setRequiresLogin(false);
    try {
      const response = await fetch(`/api/events/${eventId}/reminder`, { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) {
        setRequiresLogin(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || "Could not load reminder status.");
      setIsReminded(data.isReminded);
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Try loading reminder status again." : err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { loadReminder(); }, [loadReminder]);

  async function toggleReminder() {
    const previous = isReminded;
    const next = !previous;
    setIsReminded(next);
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/events/${eventId}/reminder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReminded: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your reminder.");
      setIsReminded(data.isReminded);
      setMessage(data.isReminded ? "Reminder saved." : "Reminder removed.");
    } catch (err) {
      setIsReminded(previous);
      if (err instanceof TypeError) setError("Network error. Your reminder was not changed.");
      else if (err.message.includes("log in")) setRequiresLogin(true);
      else setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div role="status" className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-500"><LoaderCircle size={17} className="animate-spin text-emerald-700" /> Checking reminder...</div>;
  if (requiresLogin) {
    return <Link href={`/login?next=${encodeURIComponent(`/events/${eventId}`)}`} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"><Bell size={17} /> Log in to remind me</Link>;
  }

  return (
    <div>
      <button type="button" onClick={toggleReminder} disabled={saving || Boolean(error)} aria-pressed={isReminded} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${isReminded ? "border border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50" : "bg-emerald-800 text-white hover:bg-emerald-900"}`}>
        {saving ? <LoaderCircle size={17} className="animate-spin" /> : isReminded ? <BellRing size={17} /> : <Bell size={17} />}
        {saving ? "Saving..." : isReminded ? "Reminder set" : "Remind me"}
      </button>
      {message && <p role="status" className="mt-2 text-xs font-medium text-emerald-800">{message}</p>}
      {error && <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-red-700" role="alert"><span>{error}</span><button type="button" onClick={loadReminder} className="font-semibold underline">Retry</button></div>}
    </div>
  );
}