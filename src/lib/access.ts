import { getSessionUser, readSession } from "./auth";
import { loadAlbum } from "./store";
import { tokensMatch } from "./token";
import type { Album, User } from "./types";

export function ownsAlbum(user: User, album: Album): boolean {
  return album.userId === user.id || user.albumIds.includes(album.id);
}

export async function canAccessAlbum(album: Album, token: string): Promise<boolean> {
  if (token && tokensMatch(token, album.tokenHash)) return true;
  const user = await getSessionUser();
  return !!user && ownsAlbum(user, album);
}

export async function loadAccessibleAlbum(
  id: string,
  token: string
): Promise<{ album: Album; user: User | null } | null> {
  const album = await loadAlbum(id);
  if (!album) return null;
  const user = await getSessionUser();
  if (token && tokensMatch(token, album.tokenHash)) return { album, user };
  if (user && ownsAlbum(user, album)) return { album, user };
  return null;
}

export async function sessionEmail(): Promise<string | null> {
  const session = await readSession();
  return session?.email || null;
}
