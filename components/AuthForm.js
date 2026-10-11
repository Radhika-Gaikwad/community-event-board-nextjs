"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

export default function AuthForm({ mode, next }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setToast(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Something went wrong";
        setError(message);
        setToast({ type: "error", message });
        return;
      }

      const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meResponse.json();
      if (!meResponse.ok) {
        const message = meData.error || "Your session could not be verified. Please try again.";
        setError(message);
        setToast({ type: "error", message });
        return;
      }

      setToast({ type: "success", message: isLogin ? "You’re logged in." : "Your account is ready." });
      await new Promise((resolve) => window.setTimeout(resolve, 850));
      // only allow redirects inside our own site
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext || (meData.user.role === "admin" ? "/admin" : "/"));
      router.refresh();
    } catch {
      const message = "Network error. Please check your connection and try again.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="auth-brand" href="/" aria-label="Around home">
          <span className="brand-mark"><CalendarDays size={19} strokeWidth={2.2} /></span>
          <span>around<span className="brand-dot">.</span></span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow">YOUR CITY HAS PLANS</p>
          <h2>Make a little room for <em>something good.</em></h2>
          <p>Meet your neighbours where the good stuff happens: out in the neighbourhood.</p>
        </div>
        <div className="story-bottom">
          <span>LOCAL PLANS. REAL PEOPLE.</span>
          <div className="story-categories" aria-hidden="true"><span>♪</span><span>✳</span><span>◒</span><span>↗</span></div>
        </div>
      </section>

      <section className="auth-main">
        <Link className="back-link" href="/"><ArrowLeft size={16} /> Back to home</Link>
        <form onSubmit={handleSubmit} className="auth-form">
          <p className="form-kicker">{isLogin ? "GOOD TO SEE YOU AGAIN" : "COME ON IN"}</p>
          <h1>{isLogin ? "Welcome back" : "Join the neighbourhood"}</h1>
          <p className="form-intro">{isLogin ? "Log in to pick up where you left off." : "Create an account and find something worth stepping out for."}</p>

          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={isLogin ? undefined : 8}
              autoComplete={isLogin ? "current-password" : "new-password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder={isLogin ? "Your password" : "At least 8 characters"} />
          </div>

          {error && <p role="alert" className="form-error">{error}</p>}

          <button type="submit" disabled={loading} className="auth-submit">
            <span>{loading ? (isLogin ? "Logging in..." : "Creating account...") : isLogin ? "Log in" : "Create account"}</span>
            {loading ? <LoaderCircle className="auth-spinner" size={18} aria-hidden="true" /> : <ArrowRight size={18} />}
          </button>

          <p className="auth-switch">
            {isLogin ? "New around here? " : "Already have an account? "}
            <Link href={isLogin ? "/signup" : "/login"}>
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </form>
        <p className="auth-note">GOOD PLANS, RIGHT AROUND THE CORNER</p>
      </section>
      {toast && (
        <div className={`auth-toast auth-toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
          {toast.type === "success" ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
          <span>{toast.message}</span>
        </div>
      )}
    </main>
  );
}