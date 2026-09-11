import Link from "next/link";

export const dynamic = "force-dynamic";
import { AlbumExperience } from "@/components/AlbumExperience";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { loadAlbum, saveAlbum, toPublicAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";
import type { Album } from "@/lib/types";

async function confirmPaid(album: Album): Promise<Album> {
  if (album.status !== "draft" || !album.stripeSessionId || !stripeEnabled()) {
    return album;
  }
  try {
    const session = await getStripe().checkout.sessions.retrieve(album.stripeSessionId);
    if (session.payment_status !== "paid") return album;
    album.status = "paid";
    album.email = session.customer_details?.email || session.customer_email || album.email;
    album.updatedAt = new Date().toISOString();
    await saveAlbum(album);
  } catch {
    return album;
  }
  return album;
}

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; checkout?: string }>;
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

  const album = q.checkout === "success" ? await confirmPaid(found) : found;

  return (
    <div className="min-h-full">
      <SiteHeader quiet />
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8">
        {album.status !== "draft" && q.checkout === "success" && (
          <p className="kicker mb-4">Paid. Developing now.</p>
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
