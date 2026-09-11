"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd, quoteCart } from "@/lib/commerce";
import { promoMakesDigitalFree } from "@/lib/promos";
import { MAX_EVENTS, MAX_MEMBERS, MAX_PHOTOS_PER_MEMBER } from "@/lib/site";
import { ALBUM_TAGS, MAX_TAGS } from "@/lib/tags";
import type { AlbumDraftInput, AlbumEvent, AlbumYear, FamilyMember, PublicAlbum } from "@/lib/types";
import { formatWindow, windowError } from "@/lib/years";
import { newClientId } from "@/lib/clientId";
import {
  CREATE_STEP,
  STEP_HELP,
  WIZARD_STEPS,
  draftIsReady,
  firstIncompleteStep,
  namedEvents,
  peopleProblem,
} from "@/lib/wizard";
import { HelpDialog } from "./HelpDialog";
import { PayStep, type PayChoices } from "./PayStep";

export function AlbumMaker({
  initialAlbum,
  initialToken,
  canceled = false,
  creditToken,
}: {
  initialAlbum?: PublicAlbum;
  initialToken?: string;
  canceled?: boolean;
  creditToken?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [token, setToken] = useState(initialToken || "");
  const [albumId, setAlbumId] = useState(initialAlbum?.id || "");
  const [members, setMembers] = useState<FamilyMember[]>(
    initialAlbum?.members?.length
      ? initialAlbum.members
      : [{ id: newClientId("mem"), name: "", description: "", photos: [] }]
  );
  const [start, setStart] = useState<AlbumYear>(initialAlbum?.start || { year: 1985, era: "AD" });
  const [end, setEnd] = useState<AlbumYear>(initialAlbum?.end || { year: 2010, era: "AD" });
  const [events, setEvents] = useState<AlbumEvent[]>(initialAlbum?.events || []);
  const [tags, setTags] = useState<string[]>(initialAlbum?.tags || []);
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(canceled ? "Checkout was left on the table. The album is still here." : null);
  const [pay, setPay] = useState<PayChoices>({
    extraAlbum: false,
    print: null,
    country: "US",
    promoCode: "",
    email: "",
  });
  const freeDigital = promoMakesDigitalFree(pay.promoCode);
  const cart = quoteCart({ ...pay, digitalPaid: !!creditToken, freeDigital });

  const draft: AlbumDraftInput = useMemo(
    () => ({
      members,
      start,
      end,
      events: namedEvents(events),
      tags,
    }),
    [members, start, end, events, tags]
  );

  useEffect(() => {
    if (albumId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/albums", { method: "POST" });
      const data = await res.json();
      if (cancelled || !res.ok) return;
      setAlbumId(data.album.id);
      setToken(data.token);
      const url = new URL(window.location.href);
      url.searchParams.set("album", data.album.id);
      url.searchParams.set("token", data.token);
      window.history.replaceState({}, "", url);
    })();
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  const yearProblem = windowError(start, end);
  const facesProblem = peopleProblem(members);
  const ready = draftIsReady(members, start, end);
  const helpCopy = help != null ? STEP_HELP[help] : null;

  function goTo(index: number, opts?: { help?: boolean }) {
    setError(null);
    if (index === CREATE_STEP && !ready) {
      const missing = firstIncompleteStep(members, start, end) ?? 0;
      setStep(missing);
      setHelp(missing);
      return;
    }
    setStep(index);
    if (opts?.help) setHelp(index);
    void persist().catch(() => undefined);
  }

  async function persist() {
    if (!albumId || !token) throw new Error("Album is still being opened.");
    const res = await fetch(`/api/albums/${albumId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...draft }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save.");
  }

  async function next() {
    goTo(Math.min(WIZARD_STEPS.length - 1, step + 1));
  }

  async function payNow() {
    setError(null);
    if (!ready) {
      goTo(CREATE_STEP);
      return;
    }
    try {
      setBusy(true);
      const res = await fetch(`/api/albums/${albumId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...draft,
          extraAlbum: pay.extraAlbum,
          print: pay.print,
          country: pay.country,
          creditToken: creditToken || undefined,
          promoCode: pay.promoCode,
          email: pay.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  }

  return (
    <div className="album-board p-5 sm:p-8">
        <div className="progress-bar mb-6">
          <span style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} />
        </div>
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          {WIZARD_STEPS.map((label, i) => {
            const href = `#${label.toLowerCase()}`;
            return (
              <li key={label}>
                <a
                  href={href}
                  className="wizard-link"
                  data-on={i === step}
                  data-ready={i !== CREATE_STEP || ready}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(i);
                  }}
                >
                  {String(i + 1).padStart(2, "0")} {label}
                </a>
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <PeopleStep
            members={members}
            setMembers={setMembers}
            albumId={albumId}
            token={token}
          />
        )}
        {step === 1 && <YearsStep start={start} end={end} setStart={setStart} setEnd={setEnd} />}
        {step === 2 && <EventsStep events={events} setEvents={setEvents} />}
        {step === 3 && <TagsStep tags={tags} setTags={setTags} />}
        {step === CREATE_STEP && ready && (
          <PayStep draft={draft} choices={pay} onChange={setPay} credit={!!creditToken} />
        )}

        {error && <p className="mt-6 text-[var(--accent)]">{error}</p>}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && (
            <button type="button" className="btn-ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          {step < CREATE_STEP ? (
            <button type="button" className="btn-rust" disabled={busy} onClick={next}>
              Continue
            </button>
          ) : ready ? (
            <button type="button" className="btn-rust" disabled={busy} onClick={payNow}>
              {busy
                ? "Opening checkout…"
                : (creditToken || freeDigital) && cart.totalUsd === 0
                  ? "Create album"
                  : `Pay ${formatUsd(cart.totalUsd)} and create`}
            </button>
          ) : null}
          <button
            type="button"
            className="text-sm text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4"
            onClick={() => setHelp(step)}
          >
            How this works
          </button>
          <button type="button" className="text-sm text-[var(--muted)]" onClick={() => router.push("/")}>
            Leave it for later
          </button>
        </div>
        {helpCopy && (
          <HelpDialog
            title={helpCopy.title}
            body={helpCopy.body}
            problem={help === 0 ? facesProblem : help === 1 ? yearProblem : null}
            onClose={() => setHelp(null)}
          />
        )}
    </div>
  );
}

function PeopleStep({
  members,
  setMembers,
  albumId,
  token,
}: {
  members: FamilyMember[];
  setMembers: (m: FamilyMember[]) => void;
  albumId: string;
  token: string;
}) {
  function update(id: string, patch: Partial<FamilyMember>) {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function onFiles(member: FamilyMember, files: FileList | null) {
    if (!files || !albumId || !token) return;
    const room = MAX_PHOTOS_PER_MEMBER - member.photos.length;
    const picked = Array.from(files).slice(0, room);
    const uploaded = [];
    for (const file of picked) {
      const form = new FormData();
      form.set("file", file);
      form.set("albumId", albumId);
      form.set("token", token);
      form.set("memberId", member.id);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      uploaded.push({ url: data.url, pathname: data.pathname });
    }
    update(member.id, { photos: [...member.photos, ...uploaded] });
  }

  return (
    <div className="mt-6">
      <h2 className="display text-4xl">Who’s in the picture?</h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Up to six people. A few photographs each — faces help more than group shots, but both are fine.
      </p>
      <div className="mt-6 grid gap-6">
        {members.map((member, i) => (
          <section key={member.id} className="border-t border-[var(--line)] pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--accent)]">Person {i + 1}</p>
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-[var(--muted)]"
                  onClick={() => setMembers(members.filter((m) => m.id !== member.id))}
                >
                  Remove
                </button>
              )}
            </div>
            <label className="mt-3 block text-sm text-[var(--muted)]">Name</label>
            <input
              className="field"
              value={member.name}
              onChange={(e) => update(member.id, { name: e.target.value })}
              placeholder="Nora, or Uncle Levi, or the baby"
            />
            <label className="mt-4 block text-sm text-[var(--muted)]">A little about them</label>
            <textarea
              className="area"
              value={member.description}
              onChange={(e) => update(member.id, { description: e.target.value })}
              placeholder="Always standing a little behind the group. Hates hats. Soft laugh."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              {member.photos.map((photo) => (
                <div key={photo.pathname} className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-xs text-white"
                    onClick={() =>
                      update(member.id, {
                        photos: member.photos.filter((p) => p.pathname !== photo.pathname),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {member.photos.length < MAX_PHOTOS_PER_MEMBER && (
                <label className="upload-tile">
                  Add photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      onFiles(member, e.target.files).catch((err) =>
                        alert(err instanceof Error ? err.message : "Upload failed")
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </section>
        ))}
      </div>
      {members.length < MAX_MEMBERS && (
        <button
          type="button"
          className="btn-ghost mt-6"
          onClick={() =>
            setMembers([
              ...members,
              { id: newClientId("mem"), name: "", description: "", photos: [] },
            ])
          }
        >
          Add another person
        </button>
      )}
    </div>
  );
}

function YearsStep({
  start,
  end,
  setStart,
  setEnd,
}: {
  start: AlbumYear;
  end: AlbumYear;
  setStart: (y: AlbumYear) => void;
  setEnd: (y: AlbumYear) => void;
}) {
  const problem = windowError(start, end);
  return (
    <div className="mt-6">
      <h2 className="display text-4xl">What years should we pretend?</h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Five years minimum, sixty maximum. The photographs will use the real texture of those years — wool, Kodachrome, orbital trams, whatever fits.
      </p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <YearFields label="From" value={start} onChange={setStart} />
        <YearFields label="Through" value={end} onChange={setEnd} />
      </div>
      <p className="display mt-6 text-3xl">
        {problem ? problem : `That’s ${formatWindow(start, end)}.`}
      </p>
    </div>
  );
}

function YearFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AlbumYear;
  onChange: (y: AlbumYear) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">{label}</legend>
      <input
        className="field display text-4xl"
        inputMode="numeric"
        value={value.year}
        onChange={(e) => onChange({ ...value, year: Number(e.target.value) || 0 })}
      />
      <div className="mt-3 flex gap-2">
        {(["AD", "BC"] as const).map((era) => (
          <button
            key={era}
            type="button"
            className="tag-chip"
            data-on={value.era === era}
            onClick={() => onChange({ ...value, era })}
          >
            {era === "AD" ? "AD / CE" : "BC"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function EventsStep({
  events,
  setEvents,
}: {
  events: AlbumEvent[];
  setEvents: (e: AlbumEvent[]) => void;
}) {
  return (
    <div className="mt-6">
      <h2 className="display text-4xl">What happened, or should have?</h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Up to ten. A trip, a conquest, a Tuesday. Name it and say what it was.
      </p>
      <div className="mt-6 grid gap-5">
        {events.map((event, i) => (
          <section key={event.id} className="border-t border-[var(--line)] pt-4">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-[var(--accent)]">Event {i + 1}</p>
              <button
                type="button"
                className="text-sm text-[var(--muted)]"
                onClick={() => setEvents(events.filter((e) => e.id !== event.id))}
              >
                Remove
              </button>
            </div>
            <input
              className="field"
              value={event.name}
              onChange={(e) =>
                setEvents(events.map((ev) => (ev.id === event.id ? { ...ev, name: e.target.value } : ev)))
              }
              placeholder="Trip to Disneyland"
            />
            <textarea
              className="area mt-3"
              value={event.description}
              onChange={(e) =>
                setEvents(
                  events.map((ev) => (ev.id === event.id ? { ...ev, description: e.target.value } : ev))
                )
              }
              placeholder="That time we met Goofy."
            />
          </section>
        ))}
      </div>
      {events.length < MAX_EVENTS && (
        <button
          type="button"
          className="btn-ghost mt-6"
          onClick={() =>
            setEvents([...events, { id: newClientId("evt"), name: "", description: "" }])
          }
        >
          Add an event
        </button>
      )}
    </div>
  );
}

function TagsStep({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  function toggle(tag: string) {
    if (tags.includes(tag)) setTags(tags.filter((t) => t !== tag));
    else if (tags.length < MAX_TAGS) setTags([...tags, tag]);
  }
  return (
    <div className="mt-6">
      <h2 className="display text-4xl">What’s the mood?</h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Pick up to three. They lean on the whole album — funny, formal, mythic, a quiet journal.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {ALBUM_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className="tag-chip"
            data-on={tags.includes(tag)}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <p className="mt-5 text-[var(--muted)]">
        {tags.length ? tags.join(" · ") : "None yet — candid will do."}
      </p>
    </div>
  );
}
