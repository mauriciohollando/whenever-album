import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function createAlbumToken(): string {
  return randomBytes(24).toString("hex");
}

export function hashToken(token: string): string {
  const secret = process.env.ALBUM_TOKEN_SECRET?.trim() || "dev-whenever-secret";
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export function tokensMatch(token: string, tokenHash: string): boolean {
  const a = Buffer.from(hashToken(token));
  const b = Buffer.from(tokenHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}
