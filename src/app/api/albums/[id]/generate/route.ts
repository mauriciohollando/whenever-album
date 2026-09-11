import { NextResponse } from "next/server";
import { loadAccessibleAlbum } from "@/lib/access";
import { fulfillPrintIfNeeded } from "@/lib/fulfill";
import { albumProgress, generateNextPhoto, planAlbum } from "@/lib/generate";
import { saveAlbum, toPublicAlbum } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token =
    body.token ||
    request.headers.get("x-album-token") ||
    new URL(request.url).searchParams.get("token") ||
    "";

  const found = await loadAccessibleAlbum(id, token);
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const album = found.album;
  if (album.status === "draft") {
    return NextResponse.json({ error: "Pay for the album first." }, { status: 402 });
  }
  if (album.status === "ready") {
    return NextResponse.json({ album: toPublicAlbum(album), progress: albumProgress(album) });
  }

  if (album.pages.length === 0) {
    album.status = "planning";
    album.pages = await planAlbum(album);
    album.status = "generating";
    album.updatedAt = new Date().toISOString();
    await saveAlbum(album);
    return NextResponse.json({ album: toPublicAlbum(album), progress: albumProgress(album) });
  }

  const next = await generateNextPhoto(album);
  next.updatedAt = new Date().toISOString();
  await saveAlbum(next);
  const fulfilled = next.status === "ready" ? await fulfillPrintIfNeeded(next) : next;
  return NextResponse.json({ album: toPublicAlbum(fulfilled), progress: albumProgress(fulfilled) });
}
