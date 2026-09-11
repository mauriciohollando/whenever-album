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
      <div className="page-leaf paper-grain grid min-h-[28rem] place-items-center p-8 text-center">
        <div>
          <p className="display text-3xl">The pages are still blank</p>
          <p className="mt-2 text-[#5a4636]">
            {developing
              ? "We are laying out the album first — names, years, the order of things."
              : "Nothing to turn yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 text-[#f3e6cf]">
        <div>
          <p className="hand text-xl text-[#e8c48a]">{formatWindow(album.start, album.end)}</p>
          <h1 className="display text-4xl">{title}</h1>
        </div>
        <p className="text-sm text-[#f3e6cf]/70">
          {developing && progress
            ? `Developing ${progress.done} of ${progress.total}`
            : `Page ${current.index} of ${pages.length}`}
        </p>
      </div>

      <div className="page-leaf paper-grain p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display text-3xl">{current.heading}</h2>
          <span className="hand text-xl text-[#7a6550]">{current.index}</span>
        </div>
        <div className={`mt-6 grid gap-4 ${gridClass(current)}`}>
          {current.photos.map((photo, i) => (
            <PhotoPlate
              key={photo.id}
              title={photo.title}
              year={photo.yearLabel}
              src={photo.imageUrl}
              tilt={i % 2 === 0 ? -1.4 : 1.8}
              stain={page + i}
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
          className="btn-ghost text-[#f3e6cf] border-[#f3e6cf]/30"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous page
        </button>
        <button
          type="button"
          className="btn-ghost text-[#f3e6cf] border-[#f3e6cf]/30"
          disabled={page >= pages.length - 1}
          onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
        >
          Next page
        </button>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="presentation">
          <figure
            className="paper-grain max-w-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#111]">
              {open.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.imageUrl} alt={open.title} className="max-h-[70vh] w-full object-contain" />
              ) : (
                <div className="grid h-72 place-items-center text-[#f3e6cf]/70">
                  Still in the developer tray
                </div>
              )}
            </div>
            <figcaption className="mt-4">
              <p className="display text-3xl">{open.title}</p>
              <p className="hand text-xl text-[#9b3a22]">{open.yearLabel}</p>
              <p className="mt-3 leading-relaxed">{open.description}</p>
              {open.members.length > 0 && (
                <p className="mt-3 text-sm text-[#7a6550]">{open.members.join(" · ")}</p>
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
  if (n === 3) return "sm:grid-cols-2";
  return "sm:grid-cols-2";
}
