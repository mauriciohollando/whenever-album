export const SITE_NAME = "Whenever";
export const SITE_PRICE_USD = 20;
export const ALBUM_PAGE_COUNT = 20;
export const MAX_MEMBERS = 6;
export const MAX_PHOTOS_PER_MEMBER = 5;
export const MAX_EVENTS = 10;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}
