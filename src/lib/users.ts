import { BUNDLE_REDO_CREDITS, LATER_REDO_CREDITS } from "./commerce";
import { loadAlbum, loadJson, saveAlbum, saveJson, toPublicAlbum } from "./store";
import { hashToken, newId } from "./token";
import type { Album, PrintFinish, PublicAlbum, Purchase, PurchaseKind, User } from "./types";

export type PublicUser = Omit<User, never>;

function userPath(id: string): string {
  return `users/${id}.json`;
}

function emailIndexPath(email: string): string {
  return `users/by-email/${hashToken(email)}.json`;
}

export async function loadUser(id: string): Promise<User | null> {
  return loadJson<User>(userPath(id));
}

export async function saveUser(user: User): Promise<void> {
  await saveJson(userPath(user.id), user);
  await saveJson(emailIndexPath(user.email), { userId: user.id });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const index = await loadJson<{ userId: string }>(emailIndexPath(email));
  if (!index?.userId) return null;
  return loadUser(index.userId);
}

export async function upsertUserByEmail(email: string): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  const now = new Date().toISOString();
  const user: User = {
    id: newId("usr"),
    email,
    createdAt: now,
    updatedAt: now,
    editCredits: 0,
    albumIds: [],
    purchases: [],
  };
  await saveUser(user);
  return user;
}

export async function attachAlbumToUser(user: User, album: Album): Promise<User> {
  album.userId = user.id;
  album.email = album.email || user.email;
  if (album.pendingEditCredits) {
    user.editCredits += album.pendingEditCredits;
    album.pendingEditCredits = 0;
  }
  if (!user.albumIds.includes(album.id)) {
    user.albumIds = [...user.albumIds, album.id];
  }
  user.updatedAt = new Date().toISOString();
  album.updatedAt = user.updatedAt;
  await saveUser(user);
  await saveAlbum(album);
  return user;
}

export function creditsForBook(when: "bundle" | "later"): number {
  return when === "bundle" ? BUNDLE_REDO_CREDITS : LATER_REDO_CREDITS;
}

export async function recordPurchase(
  album: Album,
  input: {
    kind: PurchaseKind;
    label: string;
    amountUsd: number;
    creditsGranted: number;
    stripeSessionId?: string;
  }
): Promise<void> {
  const key = input.stripeSessionId ? `${input.stripeSessionId}:${input.kind}` : "";

  if (album.email) {
    const user = await upsertUserByEmail(album.email);
    if (key && user.purchases.some((item) => `${item.stripeSessionId}:${item.kind}` === key)) {
      await attachAlbumToUser(user, album);
      return;
    }
    const purchase: Purchase = {
      id: newId("pur"),
      kind: input.kind,
      albumId: album.id,
      label: input.label,
      amountUsd: input.amountUsd,
      creditsGranted: input.creditsGranted,
      createdAt: new Date().toISOString(),
      stripeSessionId: input.stripeSessionId,
    };
    user.editCredits += input.creditsGranted;
    user.purchases = [...user.purchases, purchase];
    await attachAlbumToUser(user, album);
    return;
  }

  if (key && (album.recordedPurchaseKeys || []).includes(key)) return;
  album.pendingEditCredits = (album.pendingEditCredits || 0) + input.creditsGranted;
  if (key) album.recordedPurchaseKeys = [...(album.recordedPurchaseKeys || []), key];
  album.updatedAt = new Date().toISOString();
  await saveAlbum(album);
}

export async function spendEditCredit(userId: string): Promise<User | null> {
  const user = await loadUser(userId);
  if (!user || user.editCredits < 1) return null;
  user.editCredits -= 1;
  user.updatedAt = new Date().toISOString();
  await saveUser(user);
  return user;
}

export async function refundEditCredit(userId: string): Promise<void> {
  const user = await loadUser(userId);
  if (!user) return;
  user.editCredits += 1;
  user.updatedAt = new Date().toISOString();
  await saveUser(user);
}

export async function loadUserAlbums(user: User): Promise<PublicAlbum[]> {
  const albums = await Promise.all(user.albumIds.map((id) => loadAlbum(id)));
  return albums
    .filter((album): album is Album => !!album)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(toPublicAlbum);
}

export function bookPurchaseKind(finish: PrintFinish): "hardcover" | "softcover" {
  return finish;
}
