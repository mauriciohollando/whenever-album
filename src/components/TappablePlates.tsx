"use client";

import { useState } from "react";
import type { AlbumPhoto } from "@/lib/types";
import { PhotoPlate } from "./PhotoPlate";

export function TappablePlates({ photos }: { photos: AlbumPhoto[] }) {
  const [open, setOpen] = useState<AlbumPhoto | null>(null);

  return (
    <>
      <div className="mosaic">
        {photos.map((photo) => (
          <PhotoPlate
            key={photo.id}
            title={photo.title}
            year={photo.yearLabel}
            src={photo.imageUrl}
            onClick={() => setOpen(photo)}
          />
        ))}
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
              ) : null}
            </div>
            <figcaption className="mt-4 px-1">
              <p className="display text-3xl">{open.title}</p>
              <p className="mt-1 text-sm text-[var(--accent)]">{open.yearLabel}</p>
              <p className="mt-3 leading-relaxed text-white/65">{open.description}</p>
            </figcaption>
            <button type="button" className="btn-ghost mt-5" onClick={() => setOpen(null)}>
              Close
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
