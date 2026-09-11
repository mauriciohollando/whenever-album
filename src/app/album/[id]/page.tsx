import Link from "next/link";

export const dynamic = "force-dynamic";
import { AlbumExperience } from "@/components/AlbumExperience";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { applyStripeSession } from "@/lib/fulfill";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { loadAlbum, toPublicAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";
import type { Album } from "@/lib/types";

async function confirmPaid(album: Album, sessionId?: string): Promise<Album> {
  const id = sessionId || album.stripeSessionId;
  if (!id || !stripeEnabled()) return album;
  try {
    const session = await getStripe().checkout.sessions.retrieve(id);
    if (session.payment_status !== "paid") return album;
    await applyStripeSession(session);
    const next = await loadAlbum(album.id);
    return next || album;
  } catch {
    return album;
  }
}

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; checkout?: string; merch?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const token = q.token || "";
  const found = await loadAlbum(id);

  if (!found || !tokensMatch(token, found.tokenHash)) {
    return (
      <div className="min-h-full">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-16">
          <h1 className="display text-5xl">We cannot find that album</h1>
          <p className="mt-3 text-[var(--muted)]">
            The link needs the private token from checkout. If you lost it, start a new one.
          </p>
          <Link href="/make" className="btn-rust mt-6 inline-flex">
            Start again
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const album =
    q.checkout === "success" || q.merch === "success" || q.session_id
      ? await confirmPaid(found, q.session_id)
      : found;

  return (
    <div className="min-h-full">
      <SiteHeader quiet />
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8">
        {album.status !== "draft" && q.checkout === "success" && (
          <p className="kicker mb-4">
            {album.printOrder
              ? "Paid. Developing the album, then we send the book to print."
              : "Paid. Developing now."}
          </p>
        )}
        {q.merch === "success" && (
          <p className="kicker mb-4">Merch is paid. We send it to the printer from here.</p>
        )}
        {album.status === "draft" && q.checkout === "success" && (
          <p className="mb-4 text-[var(--accent)]">
            Payment is clearing. Refresh in a moment if the pages do not start.
          </p>
        )}
        <AlbumExperience initial={toPublicAlbum(album)} token={token} />
      </main>
      <SiteFooter />
    </div>
  );
}
