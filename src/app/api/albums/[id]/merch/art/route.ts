import { NextResponse } from "next/server";
import { MAX_PHOTO_BYTES } from "@/lib/site";
import { loadAlbum, storeBinary } from "@/lib/store";
import { tokensMatch } from "@/lib/token";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  const token = String(form.get("token") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Export the cropped photograph first." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPEG or PNG." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Keep the print file under 8 MB." }, { status: 400 });
  }

  const album = await loadAlbum(id);
  if (!album || !tokensMatch(token, album.tokenHash)) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  if (album.status === "draft") {
    return NextResponse.json({ error: "Pay for the album first." }, { status: 402 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const stored = await storeBinary(
    `albums/${album.id}/merch/${Date.now()}.${ext}`,
    Buffer.from(await file.arrayBuffer()),
    file.type
  );
  return NextResponse.json(stored);
}
