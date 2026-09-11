import type { CSSProperties } from "react";

const STAINS = [
  "linear-gradient(160deg, #cbb594, #8d7354 60%, #4f3b2c)",
  "linear-gradient(200deg, #9aa48a, #6a7058 50%, #3d4034)",
  "linear-gradient(140deg, #d8c3a0, #b0894a 45%, #6a4a28)",
  "linear-gradient(180deg, #b7c4c8, #6d7c86 55%, #3a444c)",
  "linear-gradient(210deg, #c9a090, #8a5a48 50%, #4a2e26)",
];

export function PhotoPlate({
  title,
  year,
  src,
  tilt = -1.5,
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
      className="photo-plate relative text-left"
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
    >
      <span className="corner top-2 left-2 border-r-0 border-b-0" />
      <span className="corner top-2 right-2 border-l-0 border-b-0" />
      <span className="corner bottom-8 left-2 border-r-0 border-t-0" />
      <span className="corner bottom-8 right-2 border-l-0 border-t-0" />
      <div
        className="slot"
        style={{ background: src ? "#111" : STAINS[stain % STAINS.length] }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end p-3">
            <span className="hand text-lg text-[#f8efe4]/80">{year}</span>
          </div>
        )}
      </div>
      <figcaption>
        {title}
        {year ? <span className="text-[#7a6550]"> · {year}</span> : null}
      </figcaption>
    </Tag>
  );
}
