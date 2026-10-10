"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode, next }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      // only allow redirects inside our own site
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext || (data.user.role === "admin" ? "/admin" : "/"));
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{isLogin ? "Welcome back" : "Create your account"}</h1>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input id="password" type="password" required minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"} value={password}
            onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          {!isLogin && <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>}
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
        </button>

        <p className="text-center text-sm text-slate-600">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-indigo-600 hover:underline">
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </form>
    </main>
  );
}