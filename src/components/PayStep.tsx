"use client";

import {
  BUNDLE_REDO_CREDITS,
  DIGITAL_USD,
  EXTRA_ALBUM_USD,
  HARDCOVER_BUNDLE_USD,
  HARDCOVER_USD,
  LATER_REDO_CREDITS,
  SHIP_COUNTRIES,
  SOFTCOVER_USD,
  TWO_ALBUMS_USD,
  formatUsd,
  laterBookUsd,
  quoteCart,
  type PrintFinish,
} from "@/lib/commerce";
import { promoMakesDigitalFree } from "@/lib/promos";
import type { AlbumDraftInput } from "@/lib/types";
import { formatWindow } from "@/lib/years";

export type PayChoices = {
  extraAlbum: boolean;
  print: PrintFinish | null;
  country: string;
  promoCode: string;
  email: string;
};

export function PayStep({
  draft,
  choices,
  onChange,
  credit,
}: {
  draft: AlbumDraftInput;
  choices: PayChoices;
  onChange: (next: PayChoices) => void;
  credit?: boolean;
}) {
  const freeDigital = promoMakesDigitalFree(choices.promoCode);
  const quote = quoteCart({ ...choices, freeDigital });

  if (credit) {
    return (
      <div className="mt-6">
        <h2 className="display text-4xl">Your second album is already paid</h2>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          The credit from the two-for-{formatUsd(TWO_ALBUMS_USD)} covers the digital album. Add a
          printed book below if you want one shipped.
        </p>
        <div className="mt-6 grid gap-3">
          <label className="pay-option" data-on={!choices.print}>
            <input
              type="radio"
              name="print"
              checked={!choices.print}
              onChange={() => onChange({ ...choices, print: null })}
            />
            <span>
              <strong>Digital only</strong>
              <em>Already paid</em>
            </span>
          </label>
          <label className="pay-option" data-on={choices.print === "hardcover"}>
            <input
              type="radio"
              name="print"
              checked={choices.print === "hardcover"}
              onChange={() => onChange({ ...choices, print: "hardcover" })}
            />
            <span>
              <strong>Add hardcover</strong>
              <em>{formatUsd(HARDCOVER_USD)} + shipping</em>
            </span>
          </label>
          <label className="pay-option" data-on={choices.print === "softcover"}>
            <input
              type="radio"
              name="print"
              checked={choices.print === "softcover"}
              onChange={() => onChange({ ...choices, print: "softcover" })}
            />
            <span>
              <strong>Add softcover</strong>
              <em>{formatUsd(SOFTCOVER_USD)} + shipping</em>
            </span>
          </label>
        </div>
        {choices.print && (
          <label className="mt-5 block">
            <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Ship the book to</span>
            <select
              className="field mt-1"
              value={choices.country}
              onChange={(event) => onChange({ ...choices, country: event.target.value })}
            >
              {SHIP_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="mt-5 block">
          <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
          <input
            className="field mt-1"
            type="email"
            autoComplete="email"
            value={choices.email}
            onChange={(event) => onChange({ ...choices, email: event.target.value })}
            placeholder="To keep the album and credits"
          />
        </label>
        <Summary draft={draft} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="kicker">the charge</p>
      <h2 className="display mt-2 text-4xl">
        {freeDigital ? "The digital album is free" : `${formatUsd(DIGITAL_USD)} develops the album`}
      </h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Pay here, then the photographs come out. A printed book with the album is a special
        offer: {BUNDLE_REDO_CREDITS} retake credits, and the book stays at today&apos;s price.
        Order the same book later and it is 5% more, with only {LATER_REDO_CREDITS} credits.
        Hoodies and mugs wait on the finished album.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="pay-option" data-on={!choices.print}>
          <input
            type="radio"
            name="print"
            checked={!choices.print}
            onChange={() => onChange({ ...choices, print: null })}
          />
          <span>
            <strong>Digital only</strong>
            <em>{freeDigital ? "Free · PDF included" : `${formatUsd(DIGITAL_USD)} · PDF included`}</em>
          </span>
        </label>
        <label className="pay-option" data-on={choices.print === "hardcover"} data-featured="true">
          <input
            type="radio"
            name="print"
            checked={choices.print === "hardcover"}
            onChange={() => onChange({ ...choices, print: "hardcover" })}
          />
          <span>
            <strong>Digital + hardcover</strong>
            <em>
              {freeDigital
                ? `${formatUsd(HARDCOVER_USD)} + shipping · ${BUNDLE_REDO_CREDITS} retake credits`
                : `${formatUsd(HARDCOVER_BUNDLE_USD)} + shipping · ${BUNDLE_REDO_CREDITS} retake credits · later ${formatUsd(laterBookUsd("hardcover"))}`}
            </em>
          </span>
        </label>
        <label className="pay-option" data-on={choices.print === "softcover"}>
          <input
            type="radio"
            name="print"
            checked={choices.print === "softcover"}
            onChange={() => onChange({ ...choices, print: "softcover" })}
          />
          <span>
            <strong>Digital + softcover</strong>
            <em>
              {freeDigital
                ? `${formatUsd(SOFTCOVER_USD)} + shipping · ${BUNDLE_REDO_CREDITS} retake credits`
                : `${formatUsd(DIGITAL_USD + SOFTCOVER_USD)} + shipping · ${BUNDLE_REDO_CREDITS} retake credits · later ${formatUsd(laterBookUsd("softcover"))}`}
            </em>
          </span>
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[var(--ink)]">
        <input
          type="checkbox"
          checked={choices.extraAlbum}
          onChange={(event) => onChange({ ...choices, extraAlbum: event.target.checked })}
        />
        <span>
          Two albums for {formatUsd(TWO_ALBUMS_USD)}
          <span className="block text-sm text-[var(--muted)]">
            +{formatUsd(EXTRA_ALBUM_USD)} now. After this one develops, you get a credit to make
            another.
          </span>
        </span>
      </label>

      <label className="mt-6 block">
        <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
        <input
          className="field mt-1"
          type="email"
          autoComplete="email"
          value={choices.email}
          onChange={(event) => onChange({ ...choices, email: event.target.value })}
          placeholder="To keep the album and credits"
        />
      </label>

      <label className="mt-6 block">
        <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Promo code</span>
        <input
          className="field mt-1"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={choices.promoCode}
          onChange={(event) => onChange({ ...choices, promoCode: event.target.value })}
          placeholder="If you have one"
        />
        {choices.promoCode.trim() ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            {freeDigital ? "Digital album is $0." : "That code is not valid."}
          </p>
        ) : null}
      </label>

      {choices.print && (
        <label className="mt-5 block">
          <span className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Ship the book to</span>
          <select
            className="field mt-1"
            value={choices.country}
            onChange={(event) => onChange({ ...choices, country: event.target.value })}
          >
            {SHIP_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Special offer with the digital album: hardcover {formatUsd(HARDCOVER_USD)}, softcover{" "}
            {formatUsd(SOFTCOVER_USD)}, and {BUNDLE_REDO_CREDITS} credits to retake photographs.
            After the album exists those books are {formatUsd(laterBookUsd("hardcover"))} and{" "}
            {formatUsd(laterBookUsd("softcover"))}, with {LATER_REDO_CREDITS} credits. Shipping is{" "}
            {formatUsd(quote.shippingUsd)} to this country. Address is collected at Stripe.
          </p>
        </label>
      )}

      <p className="mt-6 text-lg">
        Today: <strong>{formatUsd(quote.totalUsd)}</strong>
        {choices.print ? " including shipping" : ""}
      </p>

      <Summary draft={draft} />
    </div>
  );
}

function Summary({ draft }: { draft: AlbumDraftInput }) {
  return (
    <dl className="mt-6 grid gap-3 text-[var(--ink)]">
      <div>
        <dt className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">People</dt>
        <dd>{draft.members.map((m) => m.name || "unnamed").join(", ")}</dd>
      </div>
      <div>
        <dt className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Years</dt>
        <dd>{formatWindow(draft.start, draft.end)}</dd>
      </div>
      <div>
        <dt className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Events</dt>
        <dd>{draft.events.length ? draft.events.map((e) => e.name || "untitled").join(" · ") : "None named"}</dd>
      </div>
      <div>
        <dt className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Mood</dt>
        <dd>{draft.tags.length ? draft.tags.join(" · ") : "Candid"}</dd>
      </div>
    </dl>
  );
}
