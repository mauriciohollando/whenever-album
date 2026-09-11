import Link from "next/link";

export const dynamic = "force-dynamic";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSessionUser } from "@/lib/auth";
import { formatUsd } from "@/lib/commerce";
import { loadUserAlbums } from "@/lib/users";
import { AccountSignIn } from "@/components/AccountSignIn";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="min-h-full">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:px-8">
          <p className="kicker">your account</p>
          <h1 className="display mt-3 text-5xl">Sign in</h1>
          <p className="mt-3 text-[var(--muted)]">
            We keep your albums, retake credits, and purchases here. Enter the email you used at
            checkout.
          </p>
          {q.error === "expired" && (
            <p className="mt-4 text-[var(--accent)]">That sign-in link expired. Ask for a new one.</p>
          )}
          {q.error === "claim" && (
            <p className="mt-4 text-[var(--accent)]">We could not attach that album. Try signing in.</p>
          )}
          <AccountSignIn />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const albums = await loadUserAlbums(user);

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8">
        <p className="kicker">your account</p>
        <h1 className="display mt-3 text-5xl">{user.email}</h1>
        <p className="mt-4 text-lg">
          <strong>{user.editCredits}</strong> retake {user.editCredits === 1 ? "credit" : "credits"}
        </p>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          One credit remakes one photograph with a prompt you write. Open any picture in an album
          to see every version and pick which one prints.
        </p>
        <a href="/api/auth/logout" className="mt-4 inline-block text-sm text-[var(--muted)] underline underline-offset-4">
          Sign out
        </a>

        <section className="mt-12">
          <h2 className="display text-3xl">Albums</h2>
          {albums.length === 0 ? (
            <p className="mt-3 text-[var(--muted)]">
              None yet.{" "}
              <Link href="/make" className="underline underline-offset-4">
                Make one
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {albums.map((album) => {
                const names = album.members.map((member) => member.name).filter(Boolean).join(", ") || "Untitled";
                const href = album.status === "draft" ? `/make?album=${album.id}` : `/album/${album.id}`;
                return (
                  <li key={album.id}>
                    <Link href={href} className="pay-option block no-underline">
                      <span>
                        <strong>{names}</strong>
                        <em>
                          {album.status}
                          {album.printOrder ? ` · ${album.printOrder.finish} ${album.printOrder.status}` : ""}
                          {album.pendingEditCredits
                            ? ` · ${album.pendingEditCredits} credits waiting to be claimed`
                            : ""}
                        </em>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Purchases</h2>
          {user.purchases.length === 0 ? (
            <p className="mt-3 text-[var(--muted)]">Nothing charged yet.</p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {user.purchases
                .slice()
                .reverse()
                .map((purchase) => (
                  <li key={purchase.id} className="border-b border-[var(--line)] pb-3">
                    <p className="font-medium">{purchase.label}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatUsd(purchase.amountUsd)}
                      {purchase.creditsGranted
                        ? ` · ${purchase.creditsGranted} retake credits`
                        : ""}
                      {" · "}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
