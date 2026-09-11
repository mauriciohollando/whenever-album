"use client";

import { useState } from "react";
import type { AlbumPhoto } from "@/lib/types";
import { PhotoLightbox } from "./PhotoLightbox";
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
      {open && <PhotoLightbox photo={open} onClose={() => setOpen(null)} />}
    </>
  );
}
