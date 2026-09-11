"use client";

import { useMemo, useState } from "react";
import type { AlbumPage, AlbumPhoto, PublicAlbum } from "@/lib/types";
import { formatWindow } from "@/lib/years";
import { PhotoPlate } from "./PhotoPlate";

export function AlbumViewer({
  album,
  developing = false,
  progress,
}: {
  album: PublicAlbum;
  developing?: boolean;
  progress?: { done: number; total: number };
}) {
  const pages = album.pages;
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<AlbumPhoto | null>(null);
  const current = pages[page];

  const title = useMemo(() => {
    const names = album.members.map((m) => m.name).filter(Boolean);
    if (names.length === 0) return "Untitled album";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `The ${names[0]} household`;
  }, [album.members]);

  if (!current) {
    return (
      <div className="page-leaf grid min-h-[28rem] place-items-center p-8 text-center">
        <div>
          <p className="display text-4xl">Developing</p>
          <p className="mt-3 text-white/50">
            {developing
              ? "Laying out names, years, and the order of things."
              : "Nothing to turn yet."}
          </p>
        </div>
      </div>
    );
  }

  const pct =
    developing && progress && progress.total
      ? Math.round((progress.done / progress.total) * 100)
      : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">{formatWindow(album.start, album.end)}</p>
          <h1 className="display mt-2 text-5xl">{title}</h1>
        </div>
        <p className="text-sm text-white/45">
          {pct != null ? `${progress?.done}/${progress?.total} photographs` : `Page ${current.index} / ${pages.length}`}
        </p>
      </div>

      {pct != null && (
        <div className="progress-bar mb-6">
          <span style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="page-leaf p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display text-3xl sm:text-5xl">{current.heading}</h2>
          <span className="text-sm uppercase tracking-[0.16em] text-white/35">
            {String(current.index).padStart(2, "0")}
          </span>
        </div>
        <div className={`mt-6 grid gap-3 ${gridClass(current)}`}>
          {current.photos.map((photo) => (
            <PhotoPlate
              key={photo.id}
              title={photo.title}
              year={photo.yearLabel}
              src={photo.imageUrl}
              onClick={() => setOpen(photo)}
            />
          ))}
        </div>
        {album.tags.length > 0 && page === 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {album.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-ghost"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={page >= pages.length - 1}
          onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
        >
          Next
        </button>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="presentation">
          <figure
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[var(--surface)] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl bg-black">
              {open.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.imageUrl} alt={open.title} className="max-h-[70vh] w-full object-contain" />
              ) : (
                <div className="grid h-72 place-items-center text-white/40">Still developing</div>
              )}
            </div>
            <figcaption className="mt-4 px-1">
              <p className="display text-3xl">{open.title}</p>
              <p className="mt-1 text-sm text-[var(--accent)]">{open.yearLabel}</p>
              <p className="mt-3 leading-relaxed text-white/65">{open.description}</p>
              {open.members.length > 0 && (
                <p className="mt-3 text-sm text-white/35">{open.members.join(" · ")}</p>
              )}
            </figcaption>
            <button type="button" className="btn-ghost mt-5" onClick={() => setOpen(null)}>
              Close
            </button>
          </figure>
        </div>
      )}
    </div>
  );
}

function gridClass(page: AlbumPage): string {
  const n = page.photos.length;
  if (n <= 1) return "grid-cols-1 max-w-md mx-auto";
  return "sm:grid-cols-2";
}
