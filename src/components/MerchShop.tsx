"use client";

import { useMemo, useState } from "react";
import {
  MERCH,
  SHIP_COUNTRIES,
  formatUsd,
  merchProduct,
  quoteMerch,
  type MerchSku,
} from "@/lib/commerce";
import type { AlbumPhoto, MerchOrder, PublicAlbum } from "@/lib/types";

function albumPhotos(album: PublicAlbum): AlbumPhoto[] {
  return album.pages.flatMap((page) => page.photos).filter((photo) => photo.imageUrl);
}

export function MerchShop({
  album,
  token,
  preview = false,
}: {
  album: PublicAlbum;
  token?: string;
  preview?: boolean;
}) {
  const photos = useMemo(() => albumPhotos(album), [album]);
  const [sku, setSku] = useState<MerchSku>("tee");
  const [photoId, setPhotoId] = useState(photos[0]?.id || "");
  const [color, setColor] = useState(MERCH[0].colors[0].id);
  const [size, setSize] = useState(MERCH[0].sizes[1] || MERCH[0].sizes[0]);
  const [country, setCountry] = useState("US");
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = merchProduct(sku)!;
  const photo = photos.find((item) => item.id === photoId) || photos[0];
  const quote = quoteMerch(sku, country);

  function pickSku(next: MerchSku) {
    const item = merchProduct(next)!;
    setSku(next);
    setColor(item.colors[0].id);
    setSize(item.sizes[1] || item.sizes[0]);
  }

  async function exportArt(): Promise<string> {
    if (!photo?.imageUrl) throw new Error("Pick a photograph.");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = photo.imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = product.printW;
    canvas.height = product.printH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw the print file.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    const dx = (canvas.width - dw) * (x / 100);
    const dy = (canvas.height - dh) * (y / 100);
    ctx.drawImage(image, dx, dy, dw, dh);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("Could not encode print file"))), "image/jpeg", 0.92);
    });
    if (preview || !token) return URL.createObjectURL(blob);
    const form = new FormData();
    form.set("file", new File([blob], "print.jpg", { type: "image/jpeg" }));
    form.set("token", token);
    const res = await fetch(`/api/albums/${album.id}/merch/art`, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save the print file.");
    return data.url as string;
  }

  async function checkout() {
    setError(null);
    if (preview || !token) {
      setError("Make an album first. Then any page can go on a shirt.");
      return;
    }
    try {
      setBusy(true);
      const artUrl = await exportArt();
      const res = await fetch(`/api/albums/${album.id}/merch/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sku,
          photoId: photo?.id,
          color,
          size,
          country,
          artUrl,
          cropX: x,
          cropY: y,
          cropZoom: zoom,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  }

  if (!photo) return null;

  const garment = product.colors.find((item) => item.id === color)?.hex || "#f4f1ea";
  const orders = album.merchOrders || [];

  return (
    <section className="mt-14">
      <p className="kicker">from this album</p>
      <h2 className="display mt-2 text-4xl sm:text-5xl">Put a page on something</h2>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Any photograph, any product. Crop it, pick a color, we print it after you pay.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {MERCH.map((item) => (
          <button
            key={item.sku}
            type="button"
            className="tag-chip"
            data-on={item.sku === sku}
            onClick={() => pickSku(item.sku)}
          >
            {item.name} · {formatUsd(item.priceUsd)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <div
            className={`merch-stage merch-${sku}`}
            style={{ background: sku === "poster" ? "#11110f" : garment }}
          >
            <div
              className="merch-print"
              style={{
                backgroundImage: `url(${photo.imageUrl})`,
                backgroundPosition: `${x}% ${y}%`,
                backgroundSize: `${100 * zoom}%`,
              }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-[var(--muted)]">
              Left / right
              <input className="field" type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Up / down
              <input className="field" type="range" min={0} max={100} value={y} onChange={(e) => setY(Number(e.target.value))} />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Crop
              <input className="field" type="range" min={1} max={2.4} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Photograph</p>
          <div className="merch-thumbs mt-2">
            {photos.map((item) => (
              <button
                key={item.id}
                type="button"
                data-on={item.id === photo.id}
                onClick={() => setPhotoId(item.id)}
              >
                {/* Album photos are already on blob URLs; next/image is not needed here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || ""} alt={item.title} />
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((item) => (
              <button
                key={item.id}
                type="button"
                className="swatch"
                data-on={item.id === color}
                style={{ background: item.hex }}
                aria-label={item.label}
                onClick={() => setColor(item.id)}
              />
            ))}
          </div>

          <label className="mt-5 block text-sm text-[var(--muted)]">
            Size
            <select className="field" value={size} onChange={(e) => setSize(e.target.value)}>
              {product.sizes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm text-[var(--muted)]">
            Ship to
            <select className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              {SHIP_COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <p className="mt-5 text-[var(--ink)]">
            {product.blurb}
            <span className="block mt-1 text-[var(--muted)]">
              {formatUsd(quote.priceUsd)} + {formatUsd(quote.shippingUsd)} shipping
            </span>
          </p>

          <button type="button" className="btn-rust mt-4 w-full" disabled={busy} onClick={checkout}>
            {busy ? "Opening checkout…" : preview ? "Make an album to order" : `Pay ${formatUsd(quote.totalUsd)}`}
          </button>
          {error && <p className="mt-3 text-[var(--accent)]">{error}</p>}
        </div>
      </div>

      {orders.length > 0 && <OrderList orders={orders} />}
    </section>
  );
}

function OrderList({ orders }: { orders: MerchOrder[] }) {
  return (
    <div className="mt-10">
      <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Already ordered</p>
      <ul className="mt-3 grid gap-2 text-sm">
        {orders.map((order) => (
          <li key={order.id}>
            {order.sku} · {order.color} · {order.size} · {order.status}
            {order.trackingUrl ? (
              <a className="ml-2 underline underline-offset-4" href={order.trackingUrl}>
                Track
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
