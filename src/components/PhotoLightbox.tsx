import { useState } from "react";
import { photoUrl, photoVersions } from "@/lib/photos";
import type { AlbumPhoto, PublicAlbum } from "@/lib/types";

export function PhotoLightbox({
  photo,
  album,
  token,
  editCredits,
  signedIn,
  onClose,
  onAlbum,
  onCredits,
}: {
  photo: AlbumPhoto;
  album?: PublicAlbum;
  token?: string;
  editCredits?: number;
  signedIn?: boolean;
  onClose: () => void;
  onAlbum?: (album: PublicAlbum) => void;
  onCredits?: (credits: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState<"redo" | "select" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canEdit = !!album && album.status === "ready" && !!onAlbum;

  async function select(versionId: string) {
    if (!album || !onAlbum) return;
    setError(null);
    try {
      setBusy("select");
      const res = await fetch(`/api/albums/${album.id}/photos/${photo.id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, versionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not choose that version.");
      onAlbum(data.album);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not choose that version.");
    } finally {
      setBusy(null);
    }
  }

  async function redo() {
    if (!album || !onAlbum) return;
    setError(null);
    try {
      setBusy("redo");
      const res = await fetch(`/api/albums/${album.id}/photos/${photo.id}/redo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not retake that photograph.");
      onAlbum(data.album);
      if (typeof data.editCredits === "number") onCredits?.(data.editCredits);
      setPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retake that photograph.");
    } finally {
      setBusy(null);
    }
  }

  const live =
    album?.pages.flatMap((page) => page.photos).find((item) => item.id === photo.id) || photo;
  const liveVersions = photoVersions(live);
  const liveSrc = photoUrl(live);
  const liveSelected = live.selectedVersionId || liveVersions.at(-1)?.id;

  return (
    <div className="lightbox" onClick={onClose} role="presentation">
      <figure
        className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-[var(--surface)] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-[var(--photo)]">
          {liveSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={liveSrc} alt={live.title} className="max-h-[56vh] w-full object-contain" />
          ) : (
            <div className="grid h-72 place-items-center text-[var(--muted)]">Still developing</div>
          )}
        </div>
        <figcaption className="mt-4 px-1">
          <p className="display text-3xl">{live.title}</p>
          <p className="mt-1 text-sm text-[var(--accent)]">{live.yearLabel}</p>
          <p className="mt-3 leading-relaxed text-[var(--muted)]">{live.description}</p>
          {live.members.length > 0 && (
            <p className="mt-3 text-sm text-[var(--muted)]">{live.members.join(" · ")}</p>
          )}
        </figcaption>

        {(canEdit || liveVersions.length > 1) && (
          <div className="mt-5">
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">History</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              The selected version is what we print, put on merch, and put in the PDF.
            </p>
            <div className="merch-thumbs mt-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
              {liveVersions.map((version, index) => (
                <button
                  key={version.id}
                  type="button"
                  data-on={version.id === liveSelected}
                  disabled={!canEdit || busy !== null}
                  onClick={() => select(version.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={version.url} alt={version.kind === "redo" ? "Retake" : `Version ${index + 1}`} />
                </button>
              ))}
            </div>
            {liveVersions.find((item) => item.id === liveSelected)?.prompt ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {liveVersions.find((item) => item.id === liveSelected)?.kind === "redo"
                  ? "Your prompt: "
                  : "Original: "}
                {liveVersions.find((item) => item.id === liveSelected)?.prompt}
              </p>
            ) : null}
          </div>
        )}

        {canEdit && (
          <div className="mt-5">
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Retake</p>
            {signedIn ? (
              <>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {editCredits ?? 0} {editCredits === 1 ? "credit" : "credits"} left. One credit, one
                  new photograph.
                </p>
                <textarea
                  className="field mt-3 min-h-24"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Make the kitchen warmer. Uncle Levi should be laughing."
                />
                <button
                  type="button"
                  className="btn-rust mt-3"
                  disabled={busy !== null || (editCredits ?? 0) < 1}
                  onClick={redo}
                >
                  {busy === "redo" ? "Developing…" : "Retake with 1 credit"}
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                <a href="/account" className="underline underline-offset-4">
                  Sign in
                </a>{" "}
                to spend retake credits on a new prompt.
              </p>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-[var(--accent)]">{error}</p>}
        <button type="button" className="btn-ghost mt-5" onClick={onClose}>
          Close
        </button>
      </figure>
    </div>
  );
}
