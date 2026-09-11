import { NextResponse } from "next/server";
import { loadAccessibleAlbum } from "@/lib/access";
import { findAlbumPhoto, photoVersions, withSelectedVersion } from "@/lib/photos";
import { saveAlbum, toPublicAlbum } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params;
  const body = (await request.json().catch(() => ({}))) as { token?: string; versionId?: string };
  const found = await loadAccessibleAlbum(id, String(body.token || ""));
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const slot = findAlbumPhoto(found.album.pages, photoId);
  if (!slot) {
    return NextResponse.json({ error: "That photograph is not in this album." }, { status: 404 });
  }
  const versionId = String(body.versionId || "");
  if (!photoVersions(slot.photo).some((item) => item.id === versionId)) {
    return NextResponse.json({ error: "That version is not in the history." }, { status: 400 });
  }
  const nextPhoto = withSelectedVersion(slot.photo, versionId);
  found.album.pages[slot.pageIndex].photos[slot.photoIndex] = nextPhoto;
  found.album.updatedAt = new Date().toISOString();
  await saveAlbum(found.album);
  return NextResponse.json({ album: toPublicAlbum(found.album) });
}
