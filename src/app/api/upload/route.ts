import { NextResponse } from "next/server";
import { MAX_PHOTO_BYTES } from "@/lib/site";
import { loadAlbum, storeBinary } from "@/lib/store";
import { tokensMatch } from "@/lib/token";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const albumId = String(form.get("albumId") || "");
  const token = String(form.get("token") || "");
  const memberId = String(form.get("memberId") || "member");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photograph." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Keep each photograph under 8 MB." }, { status: 400 });
  }

  const album = await loadAlbum(albumId);
  if (!album || !tokensMatch(token, album.tokenHash)) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  if (album.status !== "draft") {
    return NextResponse.json({ error: "This album is already locked." }, { status: 409 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const pathname = `albums/${album.id}/refs/${memberId}-${Date.now()}.${ext}`;
  const stored = await storeBinary(pathname, Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json(stored);
}
