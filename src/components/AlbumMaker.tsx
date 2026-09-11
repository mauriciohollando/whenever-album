"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_EVENTS, MAX_MEMBERS, MAX_PHOTOS_PER_MEMBER, SITE_PRICE_USD } from "@/lib/site";
import { ALBUM_TAGS, MAX_TAGS } from "@/lib/tags";
import type { AlbumDraftInput, AlbumEvent, AlbumYear, FamilyMember, PublicAlbum } from "@/lib/types";
import { formatWindow, windowError } from "@/lib/years";
import { newClientId } from "@/lib/clientId";

const STEPS = ["People", "Years", "Happenings", "Mood", "Pay"] as const;

export function AlbumMaker({
  initialAlbum,
  initialToken,
  canceled = false,
}: {
  initialAlbum?: PublicAlbum;
  initialToken?: string;
  canceled?: boolean;
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
  const [error, setError] = useState<string | null>(canceled ? "Checkout was left on the table. The album is still here." : null);

  const draft: AlbumDraftInput = useMemo(
    () => ({
      members,
      start,
      end,
      events: events.filter((e) => e.name.trim()),
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
  const peopleProblem = members.some((m) => !m.name.trim() || m.photos.length === 0)
    ? "Every person needs a name and at least one photograph."
    : null;

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
    setError(null);
    if (step === 0 && peopleProblem) return setError(peopleProblem);
    if (step === 1 && yearProblem) return setError(yearProblem);
    try {
      setBusy(true);
      await persist();
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setError(null);
    if (peopleProblem) return setError(peopleProblem);
    if (yearProblem) return setError(yearProblem);
    try {
      setBusy(true);
      const res = await fetch(`/api/albums/${albumId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  }

  return (
    <div className="album-board p-5 sm:p-8">
        <div className="progress-bar mb-6">
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <ol className="flex flex-wrap gap-3 text-sm text-white/35">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? "text-[var(--accent)]" : ""}>
              <button type="button" onClick={() => i < step && setStep(i)} className="font-medium">
                {label}
              </button>
              {i < STEPS.length - 1 ? <span className="mx-2 text-white/15">/</span> : null}
            </li>
          ))}
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
        {step === 4 && (
          <PayStep
            members={members}
            start={start}
            end={end}
            events={events}
            tags={tags}
          />
        )}

        {error && <p className="mt-6 text-[var(--accent)]">{error}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-rust" disabled={busy} onClick={next}>
              {busy ? "Saving…" : "Continue"}
            </button>
          ) : (
            <button type="button" className="btn-rust" disabled={busy} onClick={pay}>
              {busy ? "Opening the till…" : `Pay $${SITE_PRICE_USD}`}
            </button>
          )}
          <button type="button" className="text-sm text-white/40" onClick={() => router.push("/")}>
            Leave it for later
          </button>
        </div>
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
      <p className="mt-2 max-w-xl text-white/50">
        Up to six people. A few photographs each — faces help more than group shots, but both are fine.
      </p>
      <div className="mt-6 grid gap-6">
        {members.map((member, i) => (
          <section key={member.id} className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--accent)]">Person {i + 1}</p>
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-white/40"
                  onClick={() => setMembers(members.filter((m) => m.id !== member.id))}
                >
                  Remove
                </button>
              )}
            </div>
            <label className="mt-3 block text-sm text-white/40">Name</label>
            <input
              className="field"
              value={member.name}
              onChange={(e) => update(member.id, { name: e.target.value })}
              placeholder="Nora, or Uncle Levi, or the baby"
            />
            <label className="mt-4 block text-sm text-white/40">A little about them</label>
            <textarea
              className="area"
              value={member.description}
              onChange={(e) => update(member.id, { description: e.target.value })}
              placeholder="Always standing a little behind the group. Hates hats. Soft laugh."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              {member.photos.map((photo) => (
                <div key={photo.pathname} className="relative h-20 w-20 overflow-hidden bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-0 top-0 bg-[#2a1b12]/70 px-1 text-xs text-white"
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
                <label className="grid h-20 w-20 cursor-pointer place-items-center border border-dashed border-white/15 text-xs text-white/40">
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
      <p className="mt-2 max-w-xl text-white/50">
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
      <legend className="text-sm uppercase tracking-[0.14em] text-white/40">{label}</legend>
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
      <p className="mt-2 max-w-xl text-white/50">
        Up to ten. A trip, a conquest, a Tuesday. Name it and say what it was.
      </p>
      <div className="mt-6 grid gap-5">
        {events.map((event, i) => (
          <section key={event.id} className="border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-[var(--accent)]">Event {i + 1}</p>
              <button
                type="button"
                className="text-sm text-white/40"
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
      <p className="mt-2 max-w-xl text-white/50">
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
      <p className="mt-5 text-white/50">
        {tags.length ? tags.join(" · ") : "None yet — candid will do."}
      </p>
    </div>
  );
}

function PayStep({
  members,
  start,
  end,
  events,
  tags,
}: {
  members: FamilyMember[];
  start: AlbumYear;
  end: AlbumYear;
  events: AlbumEvent[];
  tags: string[];
}) {
  return (
    <div className="mt-6">
      <h2 className="display text-4xl">Twenty dollars, then we develop it</h2>
      <p className="mt-2 max-w-xl text-white/50">
        Stripe takes the card. You land back on your album while the pages come out of the tray.
      </p>
      <dl className="mt-6 grid gap-3 text-white/80">
        <div>
          <dt className="text-sm uppercase tracking-[0.14em] text-white/40">People</dt>
          <dd>{members.map((m) => m.name || "unnamed").join(", ")}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-[0.14em] text-white/40">Years</dt>
          <dd>{formatWindow(start, end)}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-[0.14em] text-white/40">Events</dt>
          <dd>{events.length ? events.map((e) => e.name || "untitled").join(" · ") : "None named"}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-[0.14em] text-white/40">Mood</dt>
          <dd>{tags.length ? tags.join(" · ") : "Candid"}</dd>
        </div>
      </dl>
    </div>
  );
}
