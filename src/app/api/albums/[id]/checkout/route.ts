import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site";
import { albumPriceId, getStripe, stripeEnabled } from "@/lib/stripe";
import { loadAlbum, saveAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";
import { parseDraft } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const token = String(body.token || "");
  const album = await loadAlbum(id);
  if (!album || !tokensMatch(token, album.tokenHash)) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  if (album.status !== "draft") {
    return NextResponse.json({ error: "This album is already paid for." }, { status: 409 });
  }

  try {
    const draft = parseDraft(body);
    album.members = draft.members;
    album.start = draft.start;
    album.end = draft.end;
    album.events = draft.events;
    album.tags = draft.tags;
    album.updatedAt = new Date().toISOString();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Finish the album first.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const origin = siteOrigin();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: albumPriceId(), quantity: 1 }],
    customer_email: undefined,
    success_url: `${origin}/album/${album.id}?token=${token}&checkout=success`,
    cancel_url: `${origin}/make?album=${album.id}&token=${token}&checkout=cancel`,
    allow_promotion_codes: true,
    metadata: {
      product: "whenever",
      sku: "album",
      album_id: album.id,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout did not return a URL." }, { status: 500 });
  }

  album.stripeSessionId = session.id;
  await saveAlbum(album);
  return NextResponse.json({ url: session.url });
}
