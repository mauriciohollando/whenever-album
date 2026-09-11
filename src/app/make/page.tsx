import { AlbumMaker } from "@/components/AlbumMaker";

export const dynamic = "force-dynamic";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ownsAlbum } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { loadAlbum, toPublicAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";

export default async function MakePage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string; token?: string; checkout?: string; credit?: string }>;
}) {
  const q = await searchParams;
  let initialAlbum;
  const user = await getSessionUser();
  if (q.album) {
    const album = await loadAlbum(q.album);
    const allowed =
      album &&
      album.status === "draft" &&
      ((q.token && tokensMatch(q.token, album.tokenHash)) || (!!user && ownsAlbum(user, album)));
    if (allowed && album) {
      initialAlbum = toPublicAlbum(album);
    }
  }

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <p className="kicker mt-10">album brief</p>
        <h1 className="display mt-3 text-6xl sm:text-7xl">Tell us the years</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Faces, a window of time, the chapters. Then we develop the pages.
        </p>
        <div className="mt-8">
          <AlbumMaker
            initialAlbum={initialAlbum}
            initialToken={q.token}
            canceled={q.checkout === "cancel"}
            creditToken={q.credit}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
