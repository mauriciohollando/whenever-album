import { Suspense } from "react";
import Link from "next/link";
import { readSession } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";

async function AccountLink() {
  const session = await readSession();
  return (
    <Link href="/account" className="hover:text-[var(--ink)]">
      {session ? "Account" : "Sign in"}
    </Link>
  );
}

export function SiteHeader({ quiet = false }: { quiet?: boolean }) {
  return (
    <header className="site-header flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link href="/" className="display text-[1.7rem] tracking-tight">
        When<span className="text-[var(--accent)]">ever</span>
      </Link>
      <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
        {!quiet && (
          <a href="/#examples" className="hidden hover:text-[var(--ink)] sm:inline">
            Samples
          </a>
        )}
        <Suspense fallback={<Link href="/account">Sign in</Link>}>
          <AccountLink />
        </Suspense>
        {!quiet && (
          <Link href="/make" className="btn-rust px-4 py-2.5 text-sm">
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Make an album</span>
          </Link>
        )}
        {quiet && (
          <p className="hidden text-xs uppercase tracking-[0.16em] text-[var(--muted)] sm:block">
            {SITE_NAME}
          </p>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-[var(--line)] px-5 pb-8 pt-12 sm:px-8">
      <p className="text-center text-sm text-[var(--muted)]">Whenever makes one album at a time.</p>
      <p className="site-wordmark mt-8 text-center" aria-hidden>
        WHENEVER
      </p>
    </footer>
  );
}
