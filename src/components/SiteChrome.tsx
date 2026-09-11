import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader({ quiet = false }: { quiet?: boolean }) {
  return (
    <header className="glass-nav flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link href="/" className="display text-[1.7rem] tracking-tight">
        {SITE_NAME}
      </Link>
      {!quiet && (
        <nav className="flex items-center gap-5 text-sm text-white/70">
          <a href="/#examples" className="hidden sm:inline">
            Examples
          </a>
          <a href="/#guestbook" className="hidden sm:inline">
            Notes
          </a>
          <Link href="/make" className="btn-rust py-2.5 px-4">
            Start an album
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 px-5 py-10 text-center text-sm text-white/40 sm:px-8">
      <p className="display text-2xl tracking-tight text-white">$20 · 20 pages · no subscription</p>
      <p className="mt-3">Whenever makes one album at a time.</p>
    </footer>
  );
}
