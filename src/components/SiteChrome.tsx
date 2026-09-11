import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader({
  quiet = false,
  overHero = false,
}: {
  quiet?: boolean;
  overHero?: boolean;
}) {
  return (
    <header
      className={`glass-nav flex items-center justify-between gap-4 px-5 py-4 sm:px-8 ${overHero ? "is-over" : ""}`}
    >
      <Link href="/" className="display text-[1.65rem] tracking-tight">
        When<span className="text-[var(--accent)]">ever</span>
      </Link>
      {!quiet && (
        <nav className="flex items-center gap-5 text-sm text-white/65">
          <a href="/#examples" className="hidden sm:inline hover:text-white">
            Examples
          </a>
          <a href="/#guestbook" className="hidden sm:inline hover:text-white">
            Notes
          </a>
          <Link href="/make" className="btn-rust py-2.5 px-4 text-sm">
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start an album</span>
          </Link>
        </nav>
      )}
      {quiet && <p className="text-xs uppercase tracking-[0.18em] text-white/35">{SITE_NAME}</p>}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-white/10 px-5 pb-8 pt-12 sm:px-8">
      <p className="text-center text-sm text-white/45">$20 · 20 pages · no subscription</p>
      <p className="mt-2 text-center text-sm text-white/30">Whenever makes one album at a time.</p>
      <p className="site-wordmark mt-8 text-center" aria-hidden>
        WHENEVER
      </p>
    </footer>
  );
}
