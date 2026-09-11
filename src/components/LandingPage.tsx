import Link from "next/link";
import { EXAMPLE_ALBUMS, GUESTBOOK, REVIEWS } from "@/lib/examples";
import { SITE_PRICE_USD } from "@/lib/site";
import { PhotoPlate } from "./PhotoPlate";
import { SiteFooter, SiteHeader } from "./SiteChrome";

export function LandingPage() {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
          <div className="text-[#f3e6cf]">
            <p className="hand text-2xl text-[#e8c48a]">a long family album</p>
            <h1 className="display mt-2 text-5xl leading-[1.05] sm:text-7xl">
              Your people.
              <br />
              Any century.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#f3e6cf]/80">
              Send a handful of photographs, name the years — 500 BC, 1948, 2112,
              whatever you can hold in your head — and we make a twenty-page album
              where they get older as the years move. One album. ${SITE_PRICE_USD}.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/make" className="btn-rust text-lg">
                Make one for ${SITE_PRICE_USD}
              </Link>
              <a href="#examples" className="text-[#f3e6cf]/70 underline decoration-[#b0894a]/60 underline-offset-4">
                Flip a few examples
              </a>
            </div>
          </div>
          <div className="album-board relative p-5 sm:p-8">
            <p className="hand absolute -top-3 left-8 rotate-[-3deg] bg-[#f3e6cf] px-3 text-lg text-[#9b3a22]">
              left on the table
            </p>
            <div className="paper-grain p-5 sm:p-7">
              <p className="display text-3xl">The first spread</p>
              <p className="mt-1 text-sm text-[#5a4636]">Callahans · 1946–1968 · Queens</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <PhotoPlate title="Sunday shirts" year="1948" tilt={-2} stain={0} />
                <PhotoPlate title="Borrowed oars" year="1956" tilt={2.4} stain={1} />
              </div>
              <p className="hand mt-5 text-xl text-[#5a4636]">
                Frank holds the baby like a football. Nora has flour on one wrist.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 text-[#f3e6cf] md:grid-cols-3">
          {[
            {
              n: "01",
              t: "The faces",
              d: "Up to six people. Up to five photographs each. A name and a little note — who they are, how they sit in a room.",
            },
            {
              n: "02",
              t: "The years",
              d: "A window of 5 to 60 years. Far past, last Tuesday, or a future balcony. They age as the pages turn.",
            },
            {
              n: "03",
              t: "The chapters",
              d: "Up to ten events and three mood tags. Disneyland. Jerusalem. A quiet kitchen. We use all of it.",
            },
          ].map((step) => (
            <article key={step.n} className="border border-[#f3e6cf]/15 p-5">
              <p className="hand text-xl text-[#e8c48a]">{step.n}</p>
              <h2 className="display mt-1 text-2xl">{step.t}</h2>
              <p className="mt-3 leading-relaxed text-[#f3e6cf]/75">{step.d}</p>
            </article>
          ))}
        </section>

        <section id="examples" className="mt-20 scroll-mt-8">
          <div className="mb-8 text-[#f3e6cf]">
            <p className="hand text-2xl text-[#e8c48a]">examples from the shop</p>
            <h2 className="display text-4xl sm:text-5xl">Albums people have asked for</h2>
          </div>
          <div className="grid gap-8">
            {EXAMPLE_ALBUMS.map((ex, i) => (
              <article key={ex.id} className="album-board p-4 sm:p-6">
                <div className="paper-grain grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
                  <div>
                    <h3 className="display text-3xl">{ex.family}</h3>
                    <p className="mt-1 text-sm uppercase tracking-[0.14em] text-[#7a6550]">
                      {ex.window} · {ex.place}
                    </p>
                    <p className="mt-4 leading-relaxed text-[#3d2a1f]">{ex.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {ex.tags.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {ex.pages.flatMap((page) => page.photos).slice(0, 4).map((photo, pi) => (
                      <PhotoPlate
                        key={photo.id}
                        title={photo.title}
                        year={photo.yearLabel}
                        tilt={pi % 2 === 0 ? -1.8 : 2.1}
                        stain={i * 2 + pi}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          {REVIEWS.map((review) => (
            <blockquote key={review.name} className="paper-grain p-6 text-[#2a1b12] shadow-lg">
              <p className="text-lg leading-relaxed">“{review.text}”</p>
              <footer className="hand mt-4 text-xl text-[#9b3a22]">
                {review.name}
                <span className="text-[#7a6550]"> · {review.place}</span>
              </footer>
            </blockquote>
          ))}
        </section>

        <section id="guestbook" className="mt-20 scroll-mt-8 paper-grain p-6 sm:p-10">
          <h2 className="display text-4xl">The inside cover</h2>
          <p className="mt-2 max-w-xl text-[#5a4636]">
            People write in the front after they get their pages. We keep a few.
          </p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {GUESTBOOK.map((row) => (
              <li key={row.name} className="border-t border-[#2a1b12]/10 pt-4">
                <p className="hand text-2xl text-[#9b3a22]">{row.name}</p>
                <p className="mt-1 leading-relaxed">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border border-[#f3e6cf]/20 p-8 text-center text-[#f3e6cf]">
          <p className="hand text-2xl text-[#e8c48a]">the whole shop is one thing</p>
          <h2 className="display mt-2 text-4xl">Twenty dollars. Twenty pages.</h2>
          <p className="mx-auto mt-4 max-w-lg text-[#f3e6cf]/75">
            No packs, no membership, no “unlock page twelve.” You pay once, we
            develop the album, you keep the link.
          </p>
          <Link href="/make" className="btn-rust mx-auto mt-8 text-lg">
            Start yours
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
