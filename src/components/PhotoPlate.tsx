export function PhotoPlate({
  title,
  year,
  src,
  onClick,
  stain = 0,
}: {
  title: string;
  year?: string;
  src?: string | null;
  tilt?: number;
  onClick?: () => void;
  stain?: number;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="photo-plate"
    >
      <div className="slot" data-stain={stain}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} />
        ) : (
          <div className="flex h-full items-end bg-[#14141a] p-4">
            <span className="text-[var(--muted)]">{year}</span>
          </div>
        )}
      </div>
      <figcaption>
        {title}
        {year ? <span> · {year}</span> : null}
      </figcaption>
    </Tag>
  );
}
