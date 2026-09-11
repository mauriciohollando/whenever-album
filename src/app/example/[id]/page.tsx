import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumViewer } from "@/components/AlbumViewer";
import { MerchShop } from "@/components/MerchShop";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { EXAMPLE_ALBUMS, exampleToPublicAlbum, getExampleAlbum } from "@/lib/exampleAlbums";

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
  const publicAlbum = exampleToPublicAlbum(album);

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
            Make yours
          </Link>
        </div>
        <AlbumViewer album={publicAlbum} titleOverride={album.family} />
        <MerchShop album={publicAlbum} preview />
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
