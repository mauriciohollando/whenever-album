import type { AlbumPhoto } from "@/lib/types";

export function PhotoLightbox({
  photo,
  onClose,
}: {
  photo: AlbumPhoto;
  onClose: () => void;
}) {
  return (
    <div className="lightbox" onClick={onClose} role="presentation">
      <figure
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[var(--surface)] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-[var(--photo)]">
          {photo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <div className="grid h-72 place-items-center text-[var(--muted)]">
              Still developing
            </div>
          )}
        </div>
        <figcaption className="mt-4 px-1">
          <p className="display text-3xl">{photo.title}</p>
          <p className="mt-1 text-sm text-[var(--accent)]">{photo.yearLabel}</p>
          <p className="mt-3 leading-relaxed text-[var(--muted)]">{photo.description}</p>
          {photo.members.length > 0 && (
            <p className="mt-3 text-sm text-[var(--muted)]">{photo.members.join(" · ")}</p>
          )}
        </figcaption>
        <button type="button" className="btn-ghost mt-5" onClick={onClose}>
          Close
        </button>
      </figure>
    </div>
  );
}
