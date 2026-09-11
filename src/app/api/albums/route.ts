import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { saveAlbum, toPublicAlbum } from "@/lib/store";
import { createAlbumToken, hashToken, newId } from "@/lib/token";
import type { Album } from "@/lib/types";
import { attachAlbumToUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST() {
  const token = createAlbumToken();
  const now = new Date().toISOString();
  const album: Album = {
    id: newId("alb"),
    tokenHash: hashToken(token),
    email: null,
    status: "draft",
    members: [
      {
        id: newId("mem"),
        name: "",
        description: "",
        photos: [],
      },
    ],
    start: { year: 1985, era: "AD" },
    end: { year: 2010, era: "AD" },
    events: [],
    tags: [],
    pages: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveAlbum(album);
  const user = await getSessionUser();
  if (user) {
    album.email = album.email || user.email;
    await attachAlbumToUser(user, album);
  }
  return NextResponse.json({ album: toPublicAlbum(album), token });
}
