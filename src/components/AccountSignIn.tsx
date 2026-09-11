"use client";

import { useState } from "react";

export function AccountSignIn() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoginUrl(null);
    try {
      setBusy(true);
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start sign-in.");
      setMessage(
        data.emailed
          ? "Check your email for a sign-in link."
          : data.message || "Check your email for a sign-in link."
      );
      if (data.loginUrl) setLoginUrl(data.loginUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start sign-in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-8" onSubmit={submit}>
      <label className="block">
        <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
        <input
          className="field mt-1"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>
      {error && <p className="mt-3 text-[var(--accent)]">{error}</p>}
      {message && <p className="mt-3 text-[var(--muted)]">{message}</p>}
      {loginUrl && (
        <p className="mt-3">
          <a href={loginUrl} className="btn-rust inline-flex">
            Continue
          </a>
        </p>
      )}
      <button type="submit" className="btn-rust mt-5" disabled={busy}>
        {busy ? "Sending…" : "Email me a link"}
      </button>
    </form>
  );
}
