import { NextResponse } from "next/server";
import { loadAccessibleAlbum } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { redoPhotograph } from "@/lib/generate";
import { saveAlbum, toPublicAlbum } from "@/lib/store";
import { refundEditCredit, spendEditCredit } from "@/lib/users";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params;
  const body = (await request.json().catch(() => ({}))) as { token?: string; prompt?: string };
  const found = await loadAccessibleAlbum(id, String(body.token || ""));
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  if (found.album.status !== "ready") {
    return NextResponse.json({ error: "Wait until the album is developed." }, { status: 409 });
  }

  const prompt = String(body.prompt || "").trim();
  if (prompt.length < 3) {
    return NextResponse.json({ error: "Tell the model what to change." }, { status: 400 });
  }
  if (prompt.length > 800) {
    return NextResponse.json({ error: "Keep the new prompt under 800 characters." }, { status: 400 });
  }

  const user = found.user || (await getSessionUser());
  if (!user) {
    return NextResponse.json({ error: "Sign in to use retake credits." }, { status: 401 });
  }
  const spent = await spendEditCredit(user.id);
  if (!spent) {
    return NextResponse.json({ error: "You are out of retake credits." }, { status: 402 });
  }

  try {
    const next = await redoPhotograph(found.album, photoId, prompt);
    await saveAlbum(next);
    return NextResponse.json({
      album: toPublicAlbum(next),
      editCredits: spent.editCredits,
    });
  } catch (e) {
    await refundEditCredit(user.id);
    const message = e instanceof Error ? e.message : "Could not retake that photograph.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
