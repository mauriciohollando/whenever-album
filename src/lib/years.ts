import type { AlbumYear } from "./types";

export const MIN_SPAN = 5;
export const MAX_SPAN = 60;

/** Signed timeline: AD 1948 → 1948, 500 BC → -500. */
export function toSignedYear(y: AlbumYear): number {
  const n = Math.trunc(y.year);
  if (n <= 0) return 0;
  return y.era === "BC" ? -n : n;
}

export function fromSignedYear(signed: number): AlbumYear {
  if (signed < 0) return { year: Math.abs(signed), era: "BC" };
  return { year: Math.max(1, signed), era: "AD" };
}

export function formatYear(y: AlbumYear): string {
  return y.era === "BC" ? `${y.year} BC` : String(y.year);
}

export function formatWindow(start: AlbumYear, end: AlbumYear): string {
  return `${formatYear(start)}–${formatYear(end)}`;
}

export function yearSpan(start: AlbumYear, end: AlbumYear): number {
  return toSignedYear(end) - toSignedYear(start);
}

export function windowError(start: AlbumYear, end: AlbumYear): string | null {
  if (!Number.isFinite(start.year) || start.year < 1 || start.year > 9999) {
    return "Start with a year between 1 and 9999.";
  }
  if (!Number.isFinite(end.year) || end.year < 1 || end.year > 9999) {
    return "End with a year between 1 and 9999.";
  }
  const span = yearSpan(start, end);
  if (span < MIN_SPAN) {
    return `Give us at least ${MIN_SPAN} years to work with.`;
  }
  if (span > MAX_SPAN) {
    return `Keep the window to ${MAX_SPAN} years or fewer.`;
  }
  return null;
}

export function interpolateYears(
  start: AlbumYear, 
  end: AlbumYear,
  count: number
): AlbumYear[] {
  const a = toSignedYear(start);
  const b = toSignedYear(end);
  if (count <= 1) return [start];
  const out: AlbumYear[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push(fromSignedYear(Math.round(a + (b - a) * t)));
  }
  return out;
}

export function periodHint(year: AlbumYear): string {
  const s = toSignedYear(year);
  if (s <= -3000) return "deep antiquity, clay, stone, oil lamp light";
  if (s <= -800) return "late bronze / early iron age material culture";
  if (s <= -1) return "classical antiquity, linen and wool, open courtyards";
  if (s < 500) return "late antiquity, fresco light, stone streets";
  if (s < 800) return "early medieval, timber halls, candle smoke";
  if (s < 1100) return "high medieval, wool cloaks, packed earth and stone";
  if (s < 1400) return "late medieval towns, wood interiors, overcast daylight";
  if (s < 1600) return "renaissance / early modern dress and interiors";
  if (s < 1750) return "baroque-to-enlightenment clothing and rooms";
  if (s < 1840) return "regency / early industrial streets and parlors";
  if (s < 1900) return "late Victorian / Gilded Age photographs";
  if (s < 1920) return "Edwardian / WWI-era photography";
  if (s < 1940) return "interwar snapshots, silver gelatin";
  if (s < 1960) return "mid-century analog, Kodachrome warmth";
  if (s < 1980) return "1970s family snapshots, slight color cast";
  if (s < 2000) return "late 20th-century consumer film";
  if (s < 2015) return "early digital point-and-shoot";
  if (s < 2035) return "contemporary handheld photography";
  if (s < 2080) return "near-future everyday photography, familiar but advanced";
  return "far-future domestic photography, still recognizably a family album";
}
