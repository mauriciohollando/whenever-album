import { NextResponse } from "next/server";
import { saveAlbum, toPublicAlbum } from "@/lib/store";
import { createAlbumToken, hashToken, newId } from "@/lib/token";
import type { Album } from "@/lib/types";

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
  return NextResponse.json({ album: toPublicAlbum(album), token });
}
