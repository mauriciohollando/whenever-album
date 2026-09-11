"use client";

import {
  DIGITAL_USD,
  EXTRA_ALBUM_USD,
  HARDCOVER_BUNDLE_USD,
  HARDCOVER_USD,
  SHIP_COUNTRIES,
  SOFTCOVER_USD,
  TWO_ALBUMS_USD,
  formatUsd,
  quoteCart,
  type PrintFinish,
} from "@/lib/commerce";
import type { AlbumDraftInput } from "@/lib/types";
import { formatWindow } from "@/lib/years";

export type PayChoices = {
  extraAlbum: boolean;
  print: PrintFinish | null;
  country: string;
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
  const quote = quoteCart(choices);

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
        <Summary draft={draft} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="kicker">the charge</p>
      <h2 className="display mt-2 text-4xl">{formatUsd(DIGITAL_USD)} develops the album</h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Pay here, then the photographs come out. A printed book is a preorder — we send it to
        the printer after the pages exist. Hoodies and mugs wait on the finished album.
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
            <em>{formatUsd(DIGITAL_USD)} · PDF included</em>
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
              {formatUsd(HARDCOVER_BUNDLE_USD)} + shipping · {formatUsd(2)} off the separate prices
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
              {formatUsd(DIGITAL_USD + SOFTCOVER_USD)} + shipping · lighter book, same twenty pages
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
            Hardcover is {formatUsd(HARDCOVER_USD)} on its own. Softcover is {formatUsd(SOFTCOVER_USD)}.
            Shipping is {formatUsd(quote.shippingUsd)} to this country. Address is collected at
            Stripe. If the photographs fail, we refund the book.
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
