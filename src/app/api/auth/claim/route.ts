import { NextResponse } from "next/server";
import { ownsAlbum } from "@/lib/access";
import { emailLooksOk, getSessionUser, normalizeEmail, readSession, writeSession } from "@/lib/auth";
import { applyStripeSession } from "@/lib/fulfill";
import { siteOrigin } from "@/lib/site";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { loadAlbum, saveAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";
import { attachAlbumToUser, upsertUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

async function confirmStripe(sessionId?: string | null) {
  if (!sessionId || !stripeEnabled()) return;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") await applyStripeSession(session);
  } catch {
    // album page will try again
  }
}

async function claim(input: {
  albumId: string;
  token: string;
  email?: string;
  sessionId?: string | null;
}) {
  await confirmStripe(input.sessionId);
  const album = await loadAlbum(input.albumId);
  const signedIn = await getSessionUser();
  const tokenOk = !!input.token && !!album && tokensMatch(input.token, album.tokenHash);
  const ownerOk = !!album && !!signedIn && ownsAlbum(signedIn, album);
  if (!album || (!tokenOk && !ownerOk)) {
    return { error: "Album not found.", status: 404 as const };
  }
  const session = await readSession();
  const email = normalizeEmail(input.email || album.email || session?.email || signedIn?.email || "");
  if (email && emailLooksOk(email)) {
    album.email = email;
    await saveAlbum(album);
    const user = await upsertUserByEmail(email);
    await attachAlbumToUser(user, album);
    await writeSession(user.id, user.email);
    return { ok: true as const, album };
  }
  return { ok: true as const, album };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const albumId = url.searchParams.get("album") || "";
  const token = url.searchParams.get("token") || "";
  const sessionId = url.searchParams.get("session_id");
  const checkout = url.searchParams.get("checkout") || "success";
  const merch = url.searchParams.get("merch");
  const result = await claim({ albumId, token, sessionId });
  if ("error" in result) {
    return NextResponse.redirect(`${siteOrigin()}/account?error=claim`);
  }
  const next = new URL(`${siteOrigin()}/album/${albumId}`);
  next.searchParams.set("token", token);
  if (merch) next.searchParams.set("merch", merch);
  else next.searchParams.set("checkout", checkout);
  if (sessionId) next.searchParams.set("session_id", sessionId);
  return NextResponse.redirect(next);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    albumId?: string;
    token?: string;
    email?: string;
  };
  const result = await claim({
    albumId: String(body.albumId || ""),
    token: String(body.token || ""),
    email: body.email,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
