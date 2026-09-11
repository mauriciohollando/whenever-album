"use client";

import { useState } from "react";
import { downloadAlbumPdf } from "@/lib/albumPdf";
import type { PublicAlbum } from "@/lib/types";

export function DownloadPdfButton({
  album,
  title,
}: {
  album: PublicAlbum;
  title: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready =
    album.pages.length > 0 &&
    album.pages.every((page) => page.photos.every((photo) => photo.imageUrl));

  if (!ready) return null;

  return (
    <div>
      <button
        type="button"
        className="btn-ghost"
        disabled={busy}
        onClick={() => {
          setError(null);
          setBusy(true);
          downloadAlbumPdf(album, title)
            .catch((err) =>
              setError(err instanceof Error ? err.message : "Could not make the PDF.")
            )
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Making PDF…" : "Download PDF"}
      </button>
      {error && <p className="mt-2 text-sm text-[var(--accent)]">{error}</p>}
    </div>
  );
}
