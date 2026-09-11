import { AlbumMaker } from "@/components/AlbumMaker";

export const dynamic = "force-dynamic";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { loadAlbum, toPublicAlbum } from "@/lib/store";
import { tokensMatch } from "@/lib/token";

export default async function MakePage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string; token?: string; checkout?: string }>;
}) {
  const q = await searchParams;
  let initialAlbum;
  if (q.album && q.token) {
    const album = await loadAlbum(q.album);
    if (album && tokensMatch(q.token, album.tokenHash) && album.status === "draft") {
      initialAlbum = toPublicAlbum(album);
    }
  }

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <p className="hand text-2xl text-[#e8c48a]">inside the cover</p>
        <h1 className="display mt-1 text-5xl text-[#f3e6cf]">Tell us the years</h1>
        <p className="mt-3 max-w-xl text-[#f3e6cf]/75">
          Fill this the way you would talk at a table. We will ask for twenty dollars at the end.
        </p>
        <div className="mt-8">
          <AlbumMaker
            initialAlbum={initialAlbum}
            initialToken={q.token}
            canceled={q.checkout === "cancel"}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
