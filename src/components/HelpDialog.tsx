export function HelpDialog({
  title,
  body,
  problem,
  onClose,
  cta = "Got it",
}: {
  title: string;
  body: string;
  problem?: string | null;
  onClose: () => void;
  cta?: string;
}) {
  return (
    <div className="lightbox" onClick={onClose} role="presentation">
      <div
        className="help-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="kicker">{problem ? "still needed" : "a little help"}</p>
        <h3 id="help-title" className="display mt-2 text-3xl sm:text-4xl">
          {title}
        </h3>
        {problem && <p className="mt-3 font-medium text-[var(--accent)]">{problem}</p>}
        <p className="mt-4 leading-relaxed text-[var(--muted)]">{body}</p>
        <button type="button" className="btn-rust mt-7" onClick={onClose}>
          {cta}
        </button>
      </div>
    </div>
  );
}
