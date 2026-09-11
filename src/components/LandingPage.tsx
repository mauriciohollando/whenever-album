import Link from "next/link";
import { EXAMPLE_ALBUMS } from "@/lib/examples";
import { exampleCoverPhotos } from "@/lib/exampleAlbums";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const YEARS = ["500 BC", "1099", "1948", "1956", "1971", "2076", "2112"];

export function LandingPage() {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <main>
        <section className="px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:px-12">
          <p className="kicker">AI family album</p>
          <h1 className="display hero-type mt-4 max-w-4xl">
            Your people.
            <br />
            Any century.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            Drop in a few faces. Name the years. Get twenty pages back — they get
            older as time moves, whether that is 500 BC, 1948, or 2112.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/make" className="btn-rust text-base">
              Make an album
            </Link>
            <a href="#examples" className="text-sm text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]">
              Flip a sample
            </a>
          </div>
          <div className="year-row mt-12">
            {YEARS.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </section>

        <section className="grid gap-10 px-5 py-6 sm:px-8 md:grid-cols-3 lg:px-12 lg:py-10">
          {[
            {
              n: "01",
              t: "Faces",
              d: "Up to six people. Five photographs each. A name and a note — who they are in a room.",
            },
            {
              n: "02",
              t: "Years",
              d: "A window of 5 to 60 years. Far past, last Tuesday, or a future balcony. They age on the page.",
            },
            {
              n: "03",
              t: "Chapters",
              d: "Ten events. Three mood tags. Disneyland. Jerusalem. A quiet kitchen. We use all of it.",
            },
          ].map((step) => (
            <article key={step.n}>
              <p className="kicker">{step.n}</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{step.t}</h2>
              <p className="mt-3 max-w-sm text-[var(--muted)]">{step.d}</p>
            </article>
          ))}
        </section>

        <section id="examples" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12">
          <p className="kicker">three finished albums</p>
          <h2 className="display mt-3 max-w-3xl text-5xl sm:text-6xl">Open one and turn the pages</h2>
          <p className="mt-4 max-w-xl text-[var(--muted)]">
            Same format you get: twenty pages, captions on the back, tap any picture.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {EXAMPLE_ALBUMS.map((ex) => {
              const cover = exampleCoverPhotos(ex, 1)[0];
              return (
                <Link key={ex.id} href={`/example/${ex.id}`} className="cover-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover?.imageUrl ?? ""} alt={cover?.title ?? ex.family} />
                  <div className="p-5">
                    <p className="kicker">{ex.window}</p>
                    <h3 className="display mt-2 text-3xl">{ex.family}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{ex.place}</p>
                    <p className="mt-4 text-[var(--muted)]">{ex.blurb}</p>
                    <p className="mt-5 text-sm font-medium text-[var(--accent)]">Open the album</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="album-board px-6 py-14 text-center sm:px-12">
            <p className="kicker">your turn</p>
            <h2 className="display mx-auto mt-3 max-w-2xl text-5xl sm:text-6xl">
              Make one with your people
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[var(--muted)]">
              Faces, years, a few chapters. Then we develop the pages.
            </p>
            <Link href="/make" className="btn-rust mt-8">
              Start yours
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
