import { NextResponse } from "next/server";
import { loadAccessibleAlbum } from "@/lib/access";
import { saveAlbum, toPublicAlbum } from "@/lib/store";
import { parseDraft } from "@/lib/validate";

export const runtime = "nodejs";

function tokenFrom(request: Request, body?: { token?: string }): string {
  return (
    body?.token ||
    request.headers.get("x-album-token") ||
    new URL(request.url).searchParams.get("token") ||
    ""
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = tokenFrom(request);
  const found = await loadAccessibleAlbum(id, token);
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  return NextResponse.json({ album: toPublicAlbum(found.album) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const token = tokenFrom(request, body);
  const found = await loadAccessibleAlbum(id, token);
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const album = found.album;
  if (album.status !== "draft") {
    return NextResponse.json({ error: "This album is already locked." }, { status: 409 });
  }

  try {
    const draft = parseDraft(body);
    const next = {
      ...album,
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    await saveAlbum(next);
    return NextResponse.json({ album: toPublicAlbum(next) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save the album.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
