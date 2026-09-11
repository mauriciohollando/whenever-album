"use client";

import { useState } from "react";
import {
  HARDCOVER_USD,
  LATER_REDO_CREDITS,
  SHIP_COUNTRIES,
  SOFTCOVER_USD,
  formatUsd,
  laterBookUsd,
  quoteLaterBook,
  type PrintFinish,
} from "@/lib/commerce";
import type { PublicAlbum } from "@/lib/types";

export function PrintOffer({
  album,
  token,
}: {
  album: PublicAlbum;
  token?: string;
}) {
  const busyOrder =
    album.printOrder && album.printOrder.status !== "failed" && album.printOrder.status !== "refunded";
  const [print, setPrint] = useState<PrintFinish>("hardcover");
  const [country, setCountry] = useState("US");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quote = quoteLaterBook(print, country);

  async function checkout() {
    setError(null);
    try {
      setBusy(true);
      const res = await fetch(`/api/albums/${album.id}/print/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, print, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  }

  if (busyOrder) return null;

  return (
    <section className="mt-14">
      <p className="kicker">printed book</p>
      <h2 className="display mt-2 text-4xl">Order the book later</h2>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        The special offer was with the digital album — hardcover {formatUsd(HARDCOVER_USD)} or
        softcover {formatUsd(SOFTCOVER_USD)}, and 30 retake credits. Now the same books are 5% more
        and come with {LATER_REDO_CREDITS} credits.
      </p>
      <div className="mt-6 grid gap-3">
        <label className="pay-option" data-on={print === "hardcover"}>
          <input
            type="radio"
            name="later-print"
            checked={print === "hardcover"}
            onChange={() => setPrint("hardcover")}
          />
          <span>
            <strong>Hardcover</strong>
            <em>
              {formatUsd(laterBookUsd("hardcover"))} + shipping · {LATER_REDO_CREDITS} retake credits
            </em>
          </span>
        </label>
        <label className="pay-option" data-on={print === "softcover"}>
          <input
            type="radio"
            name="later-print"
            checked={print === "softcover"}
            onChange={() => setPrint("softcover")}
          />
          <span>
            <strong>Softcover</strong>
            <em>
              {formatUsd(laterBookUsd("softcover"))} + shipping · {LATER_REDO_CREDITS} retake credits
            </em>
          </span>
        </label>
      </div>
      <label className="mt-5 block">
        <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Ship the book to</span>
        <select className="field mt-1" value={country} onChange={(event) => setCountry(event.target.value)}>
          {SHIP_COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-4 text-lg">
        Today: <strong>{formatUsd(quote.totalUsd)}</strong> including shipping
      </p>
      {error && <p className="mt-3 text-[var(--accent)]">{error}</p>}
      <button type="button" className="btn-rust mt-5" disabled={busy} onClick={checkout}>
        {busy ? "Opening checkout…" : `Pay ${formatUsd(quote.totalUsd)} for the book`}
      </button>
    </section>
  );
}
