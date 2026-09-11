import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumViewer } from "@/components/AlbumViewer";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { EXAMPLE_ALBUMS, exampleToPublicAlbum, getExampleAlbum } from "@/lib/exampleAlbums";
import { SITE_PRICE_USD } from "@/lib/site";

export function generateStaticParams() {
  return EXAMPLE_ALBUMS.map((album) => ({ id: album.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = getExampleAlbum(id);
  if (!album) return { title: "Sample album — Whenever" };
  return {
    title: `${album.family} — Whenever`,
    description: album.blurb,
  };
}

export default async function ExampleAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = getExampleAlbum(id);
  if (!album) notFound();

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">sample album</p>
            <p className="mt-2 max-w-xl text-[var(--muted)]">{album.place}</p>
          </div>
          <Link href="/make" className="btn-rust">
            Make yours for ${SITE_PRICE_USD}
          </Link>
        </div>
        <AlbumViewer album={exampleToPublicAlbum(album)} titleOverride={album.family} />
        <p className="mt-10 text-center text-sm text-[var(--muted)]">
          Arrow keys turn the page.{" "}
          <Link href="/#examples" className="underline underline-offset-4">
            See the other two
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
