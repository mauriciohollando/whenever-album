"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlbumViewer } from "./AlbumViewer";
import { MerchShop } from "./MerchShop";
import { PrintOffer } from "./PrintOffer";
import type { PublicAlbum } from "@/lib/types";

export function AlbumExperience({
  initial,
  token,
  account,
}: {
  initial: PublicAlbum;
  token: string;
  account?: { email: string; editCredits: number } | null;
}) {
  const [album, setAlbum] = useState(initial);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(account?.editCredits ?? 0);
  const [signedIn, setSignedIn] = useState(!!account);
  const [claimEmail, setClaimEmail] = useState(album.email || "");

  useEffect(() => {
    setCredits(account?.editCredits ?? 0);
    setSignedIn(!!account);
  }, [account]);

  useEffect(() => {
    if (!token) return;
    void fetch("/api/auth/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId: album.id, token }),
    }).then(async (res) => {
      if (!res.ok) return;
      const me = await fetch("/api/account");
      if (!me.ok) return;
      const data = await me.json();
      if (data.user) {
        setSignedIn(true);
        setCredits(data.user.editCredits);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album.id, token]);

  useEffect(() => {
    let stop = false;
    async function tick() {
      if (stop) return;
      if (album.status === "draft") return;
      if (album.status === "ready") return;
      try {
        const res = await fetch(`/api/albums/${album.id}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not develop the next photograph.");
          return;
        }
        setAlbum(data.album);
        if (data.progress) setProgress(data.progress);
        if (data.album.status !== "ready" && data.album.status !== "failed") {
          window.setTimeout(tick, 400);
        }
        if (data.album.status === "failed") {
          setError(data.album.error || "The tray jammed.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "The tray jammed.");
      }
    }
    void tick();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album.id, album.status, token]);

  async function saveEmail(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId: album.id, token, email: claimEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save that email.");
      return;
    }
    const me = await fetch("/api/account");
    if (me.ok) {
      const next = await me.json();
      if (next.user) {
        setSignedIn(true);
        setCredits(next.user.editCredits);
      }
    }
  }

  const developing = album.status === "paid" || album.status === "planning" || album.status === "generating";

  return (
    <div>
      {album.status === "draft" && (
        <p className="muted mb-4">This album has not been paid for yet.</p>
      )}
      {error && <p className="mb-4 text-[var(--accent)]">{error}</p>}
      {signedIn && album.status === "ready" && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          {credits} retake {credits === 1 ? "credit" : "credits"} ·{" "}
          <Link href="/account" className="underline underline-offset-4">
            Account
          </Link>
        </p>
      )}
      {!signedIn && token && album.status !== "draft" && (
        <form className="mb-6 max-w-md" onSubmit={saveEmail}>
          <p className="text-sm text-[var(--muted)]">
            Save this album to an account to keep credits and every photograph version.
          </p>
          <label className="mt-3 block">
            <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
            <input
              className="field mt-1"
              type="email"
              required
              value={claimEmail}
              onChange={(event) => setClaimEmail(event.target.value)}
            />
          </label>
          <button type="submit" className="btn-ghost mt-3">
            Keep this album
          </button>
        </form>
      )}
      <AlbumViewer
        album={album}
        developing={developing}
        progress={progress}
        token={token}
        editCredits={credits}
        signedIn={signedIn}
        onAlbum={setAlbum}
        onCredits={setCredits}
      />
      {album.printOrder && (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Printed {album.printOrder.finish}: {album.printOrder.status}
          {album.printOrder.error ? ` · ${album.printOrder.error}` : ""}
          {album.printOrder.trackingUrl ? (
            <>
              {" · "}
              <a className="underline underline-offset-4" href={album.printOrder.trackingUrl}>
                Track the book
              </a>
            </>
          ) : null}
        </p>
      )}
      {album.extraAlbumToken && (album.extraAlbumRemaining ?? 0) > 0 && (
        <p className="mt-4">
          <Link href={`/make?credit=${album.extraAlbumToken}`} className="btn-rust">
            Make your second album
          </Link>
        </p>
      )}
      {album.status === "ready" && <PrintOffer album={album} token={token} />}
      {album.status === "ready" && <MerchShop album={album} token={token} />}
    </div>
  );
}
