import { loadAlbum, loadJson, saveAlbum, saveJson } from "./store";
import { createAlbumToken, hashToken, newId } from "./token";
import type { GiftCredit } from "./types";

function creditPath(tokenHash: string): string {
  return `credits/${tokenHash}.json`;
}

export async function loadCredit(token: string): Promise<GiftCredit | null> {
  if (!token.trim()) return null;
  return loadJson<GiftCredit>(creditPath(hashToken(token)));
}

export async function saveCredit(credit: GiftCredit): Promise<void> {
  await saveJson(creditPath(credit.tokenHash), credit);
}

export async function issueExtraAlbumCredit(sourceAlbumId: string, email: string | null) {
  const token = createAlbumToken();
  const credit: GiftCredit = {
    id: newId("crd"),
    tokenHash: hashToken(token),
    remaining: 1,
    email,
    sourceAlbumId,
    createdAt: new Date().toISOString(),
  };
  await saveCredit(credit);
  return { token, credit };
}

export async function consumeCredit(token: string): Promise<GiftCredit | null> {
  const credit = await loadCredit(token);
  if (!credit || credit.remaining < 1) return null;
  credit.remaining -= 1;
  await saveCredit(credit);
  const source = await loadAlbum(credit.sourceAlbumId);
  if (source) {
    source.extraAlbumRemaining = credit.remaining;
    source.updatedAt = new Date().toISOString();
    await saveAlbum(source);
  }
  return credit;
}
