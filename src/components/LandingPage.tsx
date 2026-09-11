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

const ERA_KICKER = ["kicker-amber", "kicker", "kicker-ice"] as const;

export function LandingPage() {
  const past = EXAMPLE_ALBUMS[0].pages.flatMap((p) => p.photos);
  const future = EXAMPLE_ALBUMS[2].pages.flatMap((p) => p.photos);

  return (
    <div className="min-h-full">
      <SiteHeader overHero />
      <main>
        <section className="hero-stage px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-16 lg:pt-28">
          <div className="hero-split" aria-hidden={false}>
            <figure className="hero-pane hero-pane-past">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={past[0]?.imageUrl ?? ""} alt="Sunday shirts, 1948" />
              <figcaption>1948 · Queens</figcaption>
            </figure>
            <figure className="hero-pane hero-pane-future">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={future[1]?.imageUrl ?? ""} alt="Ordered clouds, 2112" />
              <figcaption>2112 · Orbital</figcaption>
            </figure>
            <div className="hero-cut">
              <span>20</span>
            </div>
          </div>
          <div className="hero-copy mt-8 lg:mt-0">
            <p className="kicker">AI family album · $20</p>
            <h1 className="display hero-type mt-4">
              Your people.
              <br />
              Any century.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/68">
              Drop in a few faces. Name the years. Get twenty pages back — they
              get older as time moves, whether that is 500 BC, 1948, or 2112.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/make" className="btn-rust text-base sm:text-lg">
                Make one for ${SITE_PRICE_USD}
              </Link>
              <a
                href="#examples"
                className="text-sm font-medium tracking-wide text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                See the albums
              </a>
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

        <section className="grid gap-12 px-5 py-20 sm:px-8 md:grid-cols-3 lg:py-28">
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
              <p className="step-index">{step.n}</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">{step.t}</h2>
              <p className="mt-3 max-w-sm leading-relaxed text-white/55">{step.d}</p>
            </article>
          ))}
        </section>

        <section id="examples" className="scroll-mt-20">
          <div className="px-5 pb-10 sm:px-8">
            <p className="kicker">from the shop</p>
            <h2 className="display mt-3 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
              Albums people asked for
            </h2>
          </div>
          <div>
            {EXAMPLE_ALBUMS.map((ex, i) => (
              <article
                key={ex.id}
                className="grid items-start gap-8 border-t border-white/10 px-5 py-14 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:py-16"
              >
                <div>
                  <p className={`kicker ${ERA_KICKER[i] ?? "kicker"}`}>{ex.window}</p>
                  <h3 className="display mt-3 text-4xl sm:text-6xl">{ex.family}</h3>
                  <p className="mt-2 text-sm text-white/40">{ex.place}</p>
                  <p className="mt-5 max-w-md leading-relaxed text-white/68">{ex.blurb}</p>
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
            <blockquote key={review.name} className="quote-block">
              <p className="display text-3xl leading-[1.05] sm:text-[2.35rem]">
                “{review.text}”
              </p>
              <footer className="mt-6 text-sm uppercase tracking-[0.14em] text-white/40">
                {review.name} · {review.place}
              </footer>
            </blockquote>
          ))}
        </section>

        <section id="guestbook" className="scroll-mt-20 px-5 py-20 sm:px-8">
          <p className="kicker">notes on the inside cover</p>
          <h2 className="display mt-3 text-5xl sm:text-6xl">People keep writing back</h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {GUESTBOOK.map((row) => (
              <li key={row.name} className="bg-[var(--bg)] p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {row.name}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-white/72">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[#f4f0e6] px-6 py-16 text-[#050508] sm:mx-8 sm:px-12 sm:py-20">
          <p className="kicker !text-[#d5183f]">one product</p>
          <h2 className="display mx-auto mt-3 max-w-3xl text-5xl sm:text-7xl">
            Twenty dollars.
            <br />
            Twenty pages.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[#050508]/65">
            No packs. No membership. You pay once, we develop the album, you keep the link.
          </p>
          <Link href="/make" className="btn-rust mt-8 !bg-[#050508] !text-white">
            Start yours
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
