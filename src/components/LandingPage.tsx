import Link from "next/link";
import { EXAMPLE_ALBUMS, GUESTBOOK, REVIEWS } from "@/lib/examples";
import { SITE_PRICE_USD } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { TappablePlates } from "./TappablePlates";

const YEARS = [
  "500 BC",
  "1099",
  "1948",
  "1956",
  "1971",
  "2076",
  "2112",
  "any century you want",
];

export function LandingPage() {
  const hero = EXAMPLE_ALBUMS[0].pages.flatMap((p) => p.photos);
  const future = EXAMPLE_ALBUMS[2].pages.flatMap((p) => p.photos);

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main>
        <section className="grid items-end gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[calc(100vh-4.5rem)] lg:pb-20">
          <div>
            <p className="kicker">AI family album · $20</p>
            <h1 className="display hero-type mt-4">
              Your people.
              <br />
              <span className="text-[var(--accent)]">Any century.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65">
              Drop in a few faces. Name the years. Get twenty pages back — they
              get older as time moves, whether that is 500 BC, 1948, or 2112.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/make" className="btn-rust text-base sm:text-lg">
                Make one for ${SITE_PRICE_USD}
              </Link>
              <a href="#examples" className="text-white/60 underline decoration-white/20 underline-offset-4">
                See the albums
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl pb-10">
            <div className="hero-photo stack-a">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero[0]?.imageUrl ?? ""} alt="Sunday shirts, 1948" />
            </div>
            <div className="hero-photo stack-b ring-4 ring-[var(--bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={future[1]?.imageUrl ?? ""} alt="Ordered clouds, 2112" />
            </div>
            <div className="hero-photo stack-c ring-4 ring-[var(--bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={EXAMPLE_ALBUMS[1].pages[1].photos[0].imageUrl ?? ""} alt="1099" />
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[...YEARS, ...YEARS].map((year, i) => (
              <span key={`${year}-${i}`}>
                {year}
                <span className="mx-3 text-[var(--accent)]">●</span>
              </span>
            ))}
          </div>
        </div>

        <section className="grid gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
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
              <p className="display text-6xl text-white/12">{step.n}</p>
              <h2 className="display mt-3 text-4xl">{step.t}</h2>
              <p className="mt-3 max-w-sm leading-relaxed text-white/55">{step.d}</p>
            </article>
          ))}
        </section>

        <section id="examples" className="scroll-mt-20">
          <div className="px-5 pb-8 sm:px-8">
            <p className="kicker">from the shop</p>
            <h2 className="display mt-3 text-5xl sm:text-7xl">Albums people asked for</h2>
          </div>
          <div className="grid">
            {EXAMPLE_ALBUMS.map((ex) => (
              <article
                key={ex.id}
                className="grid items-center gap-8 border-t border-white/10 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]"
              >
                <div>
                  <p className="kicker">{ex.window}</p>
                  <h3 className="display mt-3 text-4xl sm:text-5xl">{ex.family}</h3>
                  <p className="mt-2 text-sm text-white/40">{ex.place}</p>
                  <p className="mt-5 max-w-md leading-relaxed text-white/65">{ex.blurb}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {ex.tags.map((tag) => (
                      <span key={tag} className="tag-chip text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <TappablePlates
                  photos={ex.pages.flatMap((page) => page.photos).slice(0, 4)}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-px bg-white/10 md:grid-cols-2">
          {REVIEWS.map((review) => (
            <blockquote key={review.name} className="bg-[var(--bg)] p-8 sm:p-12">
              <p className="display text-3xl leading-tight sm:text-4xl">“{review.text}”</p>
              <footer className="mt-6 text-sm text-white/45">
                {review.name} · {review.place}
              </footer>
            </blockquote>
          ))}
        </section>

        <section id="guestbook" className="scroll-mt-20 px-5 py-20 sm:px-8">
          <p className="kicker">notes on the inside cover</p>
          <h2 className="display mt-3 text-5xl">People keep writing back</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {GUESTBOOK.map((row) => (
              <li key={row.name} className="rounded-3xl border border-white/10 p-6">
                <p className="text-sm font-medium text-[var(--accent)]">{row.name}</p>
                <p className="mt-2 text-lg leading-relaxed text-white/70">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[var(--accent)] px-6 py-16 text-center text-white sm:mx-8 sm:px-10">
          <p className="kicker !text-white/80">one product</p>
          <h2 className="display mx-auto mt-3 max-w-3xl text-5xl sm:text-7xl">
            Twenty dollars.
            <br />
            Twenty pages.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-white/80">
            No packs. No membership. You pay once, we develop the album, you keep the link.
          </p>
          <Link href="/make" className="mt-8 inline-flex rounded-full bg-black px-6 py-3.5 font-semibold text-white">
            Start yours
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
