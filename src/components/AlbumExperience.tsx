"use client";

import { useEffect, useState } from "react";
import { AlbumViewer } from "./AlbumViewer";
import type { PublicAlbum } from "@/lib/types";

export function AlbumExperience({
  initial,
  token,
}: {
  initial: PublicAlbum;
  token: string;
}) {
  const [album, setAlbum] = useState(initial);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

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
    // Only re-run when status changes to something we should develop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album.id, album.status, token]);

  const developing = album.status === "paid" || album.status === "planning" || album.status === "generating";

  return (
    <div>
      {album.status === "draft" && (
        <p className="mb-4 text-[#f3e6cf]">This album has not been paid for yet.</p>
      )}
      {error && <p className="mb-4 text-[#e8c48a]">{error}</p>}
      <AlbumViewer album={album} developing={developing} progress={progress} />
    </div>
  );
}
