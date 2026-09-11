"use client";

import { useEffect, useMemo, useState } from "react";
import type { AlbumPage, AlbumPhoto, PublicAlbum } from "@/lib/types";
import { formatWindow } from "@/lib/years";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { PhotoLightbox } from "./PhotoLightbox";
import { PhotoPlate } from "./PhotoPlate";

export function AlbumViewer({
  album,
  developing = false,
  progress,
  titleOverride,
  token,
  editCredits,
  signedIn,
  onAlbum,
  onCredits,
}: {
  album: PublicAlbum;
  developing?: boolean;
  progress?: { done: number; total: number };
  titleOverride?: string;
  token?: string;
  editCredits?: number;
  signedIn?: boolean;
  onAlbum?: (album: PublicAlbum) => void;
  onCredits?: (credits: number) => void;
}) {
  const pages = album.pages;
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<AlbumPhoto | null>(null);
  const current = pages[page];

  const title = useMemo(() => {
    if (titleOverride) return titleOverride;
    const names = album.members.map((member) => member.name).filter(Boolean);
    if (names.length === 0) return "Untitled album";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `The ${names[0]} household`;
  }, [album.members, titleOverride]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (open) {
        if (event.key === "Escape") setOpen(null);
        return;
      }
      if (event.key === "ArrowRight") setPage((p) => Math.min(pages.length - 1, p + 1));
      if (event.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pages.length]);

  if (!current) {
    return (
      <div className="page-leaf grid min-h-[26rem] place-items-center p-8 text-center">
        <div>
          <p className="display text-4xl">Developing</p>
          <p className="muted mt-3">
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[var(--muted)]">
            {pct != null
              ? `${progress?.done}/${progress?.total} photographs`
              : `Page ${current.index} / ${pages.length}`}
          </p>
          {!developing && <DownloadPdfButton album={album} title={title} />}
        </div>
      </div>

      {pct != null && (
        <div className="progress-bar mb-6">
          <span style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="page-leaf p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display text-3xl sm:text-5xl">{current.heading}</h2>
          <span className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
            {String(current.index).padStart(2, "0")}
          </span>
        </div>
        <div className={`mt-6 grid gap-4 ${gridClass(current)}`}>
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
        <div className="page-dots" aria-label="Album pages">
          {pages.map((item, i) => (
            <button
              key={item.index}
              type="button"
              data-on={i === page}
              aria-label={`Page ${item.index}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
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
        <PhotoLightbox
          photo={album.pages.flatMap((page) => page.photos).find((item) => item.id === open.id) || open}
          album={onAlbum ? album : undefined}
          token={token}
          editCredits={editCredits}
          signedIn={signedIn}
          onClose={() => setOpen(null)}
          onAlbum={onAlbum}
          onCredits={onCredits}
        />
      )}
    </div>
  );
}

function gridClass(page: AlbumPage): string {
  const n = page.photos.length;
  if (n <= 1) return "mx-auto max-w-md grid-cols-1";
  return "sm:grid-cols-2";
}
