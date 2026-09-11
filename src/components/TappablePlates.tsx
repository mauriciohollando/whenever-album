"use client";

import { useState } from "react";
import type { AlbumPhoto } from "@/lib/types";
import { PhotoPlate } from "./PhotoPlate";

export function TappablePlates({ photos }: { photos: AlbumPhoto[] }) {
  const [open, setOpen] = useState<AlbumPhoto | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, i) => (
          <PhotoPlate
            key={photo.id}
            title={photo.title}
            year={photo.yearLabel}
            src={photo.imageUrl}
            tilt={i % 2 === 0 ? -1.8 : 2.1}
            stain={i}
            onClick={() => setOpen(photo)}
          />
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="presentation">
          <figure className="paper-grain max-w-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#111]">
              {open.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.imageUrl} alt={open.title} className="max-h-[70vh] w-full object-contain" />
              ) : null}
            </div>
            <figcaption className="mt-4">
              <p className="display text-3xl">{open.title}</p>
              <p className="hand text-xl text-[#9b3a22]">{open.yearLabel}</p>
              <p className="mt-3 leading-relaxed">{open.description}</p>
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
