import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader({ quiet = false }: { quiet?: boolean }) {
  return (
    <header className="flex items-end justify-between gap-4 px-5 py-6 text-[#f3e6cf] sm:px-8">
      <Link href="/" className="display text-2xl tracking-wide">
        {SITE_NAME}
      </Link>
      {!quiet && (
        <nav className="flex items-center gap-5 text-sm text-[#f3e6cf]/80">
          <a href="/#examples">Examples</a>
          <a href="/#guestbook">Guestbook</a>
          <Link href="/make" className="btn-rust py-2 text-[#f8efe4]">
            Start an album
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-5 py-10 text-center text-sm text-[#f3e6cf]/55 sm:px-8">
      <p className="hand text-xl text-[#f3e6cf]/70">One album. Twenty pages. Twenty dollars.</p>
      <p className="mt-2">Whenever is a small shop, not a subscription.</p>
    </footer>
  );
}
