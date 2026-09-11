import { toFile } from "openai";
import { geminiConfigured, generateGeminiPhotograph } from "./gemini";
import { getOpenAI, imageModel, openaiConfigured } from "./openai";
import { ALBUM_PAGE_COUNT } from "./site";
import { storeBinary } from "./store";
import { newId } from "./token";
import type { Album, AlbumPage, AlbumPhoto, PhotoVersion } from "./types";
import { formatWindow, formatYear, interpolateYears, periodHint } from "./years";
import { findAlbumPhoto, photoVersions } from "./photos";

const PLAN_SCHEMA_HINT = `{
  "pages": [
    {
      "index": 1,
      "heading": "short page title",
      "photos": [
        {
          "title": "short photo name",
          "description": "1-2 sentences, specific, in-world",
          "yearLabel": "1948 or 500 BC or 2112",
          "members": ["Name"]
        }
      ]
    }
  ]
}`;

function memberBrief(album: Album): string {
  return album.members
    .map((m) => {
      const pics = m.photos.length;
      return `- ${m.name}: ${m.description || "no extra notes"} (${pics} reference photo${pics === 1 ? "" : "s"})`;
    })
    .join("\n");
}

function eventBrief(album: Album): string {
  if (album.events.length === 0) return "No named events — invent ordinary years that still feel specific.";
  return album.events
    .map((e) => `- ${e.name}: ${e.description || "no extra notes"}`)
    .join("\n");
}

export function fallbackPlan(album: Album): AlbumPage[] {
  const years = interpolateYears(album.start, album.end, ALBUM_PAGE_COUNT);
  const names = album.members.map((m) => m.name);
  const events = album.events;

  return years.map((year, i) => {
    const index = i + 1;
    const yearLabel = formatYear(year);
    const event = events.length ? events[i % events.length] : null;
    const count = [1, 2, 3, 2, 4, 1, 2, 3][i % 8];
    const heading = event
      ? i % 3 === 0
        ? event.name
        : `Around ${yearLabel}`
      : index === 1
        ? `The first year`
        : index === ALBUM_PAGE_COUNT
          ? `Still here, ${yearLabel}`
          : `Page ${index}`;

    const photos: AlbumPhoto[] = Array.from({ length: count }, (_, p) => {
      const who = names.filter((_, n) => (n + i + p) % Math.max(names.length, 1) < Math.ceil(names.length / 2));
      const featured = who.length ? who : names.slice(0, 1);
      const title = event && p === 0 ? event.name : `${featured[0] ?? "Family"}, ${yearLabel}`;
      const description = event
        ? `${event.description || event.name} — ${featured.join(", ")} in ${yearLabel}, a little older than the last time we saw them.`
        : `${featured.join(", ")} photographed in ${yearLabel}. The years are doing their quiet work.`;
      return {
        id: `p${index}_${p + 1}`,
        title,
        description,
        yearLabel,
        imageUrl: null,
        members: featured,
        versions: [],
      };
    });

    return { index, heading, photos };
  });
}

export async function planAlbum(album: Album): Promise<AlbumPage[]> {
  if (!openaiConfigured()) return fallbackPlan(album);

  const openai = getOpenAI();
  const window = formatWindow(album.start, album.end);
  const prompt = `You are making a 20-page physical family photo album.

YEAR WINDOW: ${window} (span of years the album covers). People must age as the years move. Use the actual historical, mythic, or future texture of those years — clothing, rooms, light, objects, public life. If the window is BC, medieval, 1940s, 2000s, or 2070–2120, commit to that world. Do not modernize a past century unless the tags ask for a joke.

FAMILY:
${memberBrief(album)}

EVENTS TO COVER (weave these in; they can be silly, sacred, or both):
${eventBrief(album)}

MOOD TAGS: ${album.tags.join(", ") || "Candid"}

RULES:
- Exactly 20 pages, indexes 1-20.
- Each page has 1 to 4 photographs (mix the layouts; do not make every page a grid of 4).
- Page 1 is an opening / group or doorway-into-the-years picture.
- Later pages show the same people older. Early pages younger.
- Every photograph needs a short title and a 1-2 sentence description in a warm, specific voice — like a relative wrote it on the back.
- yearLabel must be a year inside the window, formatted like "1948", "500 BC", or "2112".
- members must be names from the family list (subset is fine).
- Cover every named event at least once.
- No text burned into the imagined photographs themselves.

Return ONLY valid JSON matching:
${PLAN_SCHEMA_HINT}`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You write family album structures as JSON." },
        { role: "user", content: prompt },
      ],
    });
    const raw = result.choices[0]?.message?.content;
    if (!raw) return fallbackPlan(album);
    const parsed = JSON.parse(raw) as { pages?: AlbumPage[] };
    const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
    if (pages.length < 10) return fallbackPlan(album);
    return normalizePages(pages);
  } catch {
    return fallbackPlan(album);
  }
}

function normalizePages(pages: AlbumPage[]): AlbumPage[] {
  const trimmed = pages.slice(0, ALBUM_PAGE_COUNT);
  return trimmed.map((page, i) => {
    const photos = (page.photos || []).slice(0, 4).map((photo, p) => ({
      id: photo.id || `p${i + 1}_${p + 1}`,
      title: String(photo.title || "Untitled").slice(0, 80),
      description: String(photo.description || "").slice(0, 400),
      yearLabel: String(photo.yearLabel || ""),
      imageUrl: null,
      members: Array.isArray(photo.members) ? photo.members.map(String).slice(0, 6) : [],
      versions: [],
    }));
    return {
      index: i + 1,
      heading: String(page.heading || `Page ${i + 1}`).slice(0, 80),
      photos: photos.length
        ? photos
        : [
            {
              id: `p${i + 1}_1`,
              title: "Untitled",
              description: "A page waiting for a photograph.",
              yearLabel: "",
              imageUrl: null,
              members: [],
              versions: [],
            },
          ],
    };
  });
}

function nextMissingPhoto(album: Album): { page: number; photo: number } | null {
  for (let p = 0; p < album.pages.length; p++) {
    for (let i = 0; i < album.pages[p].photos.length; i++) {
      if (!album.pages[p].photos[i].imageUrl) return { page: p, photo: i };
    }
  }
  return null;
}

export function albumProgress(album: Album): { done: number; total: number } {
  const photos = album.pages.flatMap((p) => p.photos);
  return {
    done: photos.filter((p) => p.imageUrl).length,
    total: photos.length,
  };
}

export async function generateNextPhoto(album: Album): Promise<Album> {
  const slot = nextMissingPhoto(album);
  if (!slot) {
    return { ...album, status: "ready", error: undefined };
  }

  const page = album.pages[slot.page];
  const photo = page.photos[slot.photo];
  const refs = album.members.filter((m) =>
    photo.members.some((n) => n.toLowerCase() === m.name.toLowerCase())
  );
  const useRefs = refs.length ? refs : album.members.slice(0, 2);

  const yearBits = photo.yearLabel.toLowerCase().includes("bc")
    ? { year: parseInt(photo.yearLabel, 10) || 1, era: "BC" as const }
    : { year: parseInt(photo.yearLabel, 10) || toSignedFallback(album), era: "AD" as const };

  const prompt = `Create a single photograph for a physical family album.

It should look like a real printed photograph from ${photo.yearLabel}, not a digital collage or poster.
Period: ${periodHint(yearBits)}.
Mood tags: ${album.tags.join(", ") || "Candid"}.
People (keep a strong likeness to any reference photos): ${useRefs.map((m) => `${m.name} — ${m.description}`).join("; ")}.
Age them to fit ${photo.yearLabel} inside a life that runs ${formatWindow(album.start, album.end)}. Same faces, older or younger as the year demands.
Scene title: ${photo.title}
What is happening: ${photo.description}
Page heading: ${page.heading}

Photograph only. No captions, no borders, no typography, no watermark, no split-screen. One moment, one camera.`;

  if (!geminiConfigured() && !openaiConfigured()) {
    page.photos[slot.photo] = { ...photo, imageUrl: null };
    return {
      ...album,
      status: "failed",
      error: "No image model is configured (need GEMINI_API_KEY for Nano Banana).",
    };
  }

  try {
    const version = await renderVersion(
      prompt,
      useRefs.flatMap((m) => m.photos.map((p) => p.url)),
      album.id,
      photo.id,
      "original"
    );
    version.prompt = photo.description;
    page.photos[slot.photo] = {
      ...photo,
      imageUrl: version.url,
      versions: [version],
      selectedVersionId: version.id,
    };
    const { done, total } = albumProgress(album);
    return {
      ...album,
      status: done >= total ? "ready" : "generating",
      error: undefined,
    };
  } catch (e) {
    return {
      ...album,
      status: "failed",
      error: e instanceof Error ? e.message : "Photograph failed",
    };
  }
}

function toSignedFallback(album: Album): number {
  return album.start.era === "BC" ? album.start.year : album.start.year;
}

async function renderVersion(
  prompt: string,
  referenceUrls: string[],
  albumId: string,
  photoId: string,
  kind: PhotoVersion["kind"]
): Promise<PhotoVersion> {
  const refs = referenceUrls.slice(0, 4);
  let buffer: Buffer | null = null;

  if (geminiConfigured()) {
    buffer = await generateGeminiPhotograph(prompt, refs);
  } else {
    buffer = await generateOpenAiPhotograph(prompt, refs);
  }

  const versionId = newId("ver");
  const stored = await storeBinary(
    `albums/${albumId}/photos/${photoId}/${versionId}.png`,
    buffer,
    "image/png"
  );
  return {
    id: versionId,
    url: stored.url,
    prompt,
    createdAt: new Date().toISOString(),
    kind,
  };
}

export async function redoPhotograph(
  album: Album,
  photoId: string,
  direction: string
): Promise<Album> {
  const found = findAlbumPhoto(album.pages, photoId);
  if (!found) throw new Error("That photograph is not in this album.");
  if (!found.photo.imageUrl) throw new Error("Wait until this photograph exists.");

  const page = album.pages[found.pageIndex];
  const photo = found.photo;
  const refs = album.members.filter((m) =>
    photo.members.some((n) => n.toLowerCase() === m.name.toLowerCase())
  );
  const useRefs = refs.length ? refs : album.members.slice(0, 2);
  const yearBits = photo.yearLabel.toLowerCase().includes("bc")
    ? { year: parseInt(photo.yearLabel, 10) || 1, era: "BC" as const }
    : { year: parseInt(photo.yearLabel, 10) || toSignedFallback(album), era: "AD" as const };

  const prompt = `Create a single photograph for a physical family album.

It should look like a real printed photograph from ${photo.yearLabel}, not a digital collage or poster.
Period: ${periodHint(yearBits)}.
Mood tags: ${album.tags.join(", ") || "Candid"}.
People (keep a strong likeness to any reference photos): ${useRefs.map((m) => `${m.name} — ${m.description}`).join("; ")}.
Age them to fit ${photo.yearLabel} inside a life that runs ${formatWindow(album.start, album.end)}. Same faces, older or younger as the year demands.
Scene title: ${photo.title}
What is happening: ${photo.description}
Page heading: ${page.heading}

The owner asked for this change. Follow it closely, but keep it one photograph from the same year and family:
${direction.trim()}

Photograph only. No captions, no borders, no typography, no watermark, no split-screen. One moment, one camera.`;

  if (!geminiConfigured() && !openaiConfigured()) {
    throw new Error("No image model is configured (need GEMINI_API_KEY for Nano Banana).");
  }

  const version = await renderVersion(
    prompt,
    useRefs.flatMap((m) => m.photos.map((p) => p.url)),
    album.id,
    photo.id,
    "redo"
  );
  version.prompt = direction.trim();
  const versions = [...photoVersions(photo), version];
  page.photos[found.photoIndex] = {
    ...photo,
    imageUrl: version.url,
    versions,
    selectedVersionId: version.id,
  };
  album.updatedAt = new Date().toISOString();
  return album;
}

async function generateOpenAiPhotograph(
  prompt: string,
  refs: string[]
): Promise<Buffer> {
  const openai = getOpenAI();
  const model = imageModel();
  let b64: string | undefined;

  if (refs.length > 0) {
    try {
      const files = await Promise.all(
        refs.map(async (url, i) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`ref ${i} ${res.status}`);
          const bytes = Buffer.from(await res.arrayBuffer());
          const type = res.headers.get("content-type") || "image/jpeg";
          const ext = type.includes("png") ? "png" : "jpg";
          return toFile(bytes, `ref-${i}.${ext}`, { type });
        })
      );
      const edited = await openai.images.edit({
        model,
        image: files,
        prompt,
        size: "1024x1024",
        quality: "medium",
      });
      b64 = edited.data?.[0]?.b64_json;
    } catch {
      b64 = undefined;
    }
  }

  if (!b64) {
    const generated = await openai.images.generate({
      model,
      prompt,
      size: "1024x1024",
      quality: "medium",
      n: 1,
    });
    b64 = generated.data?.[0]?.b64_json;
    const legacy = generated.data?.[0] as { url?: string } | undefined;
    if (!b64 && legacy?.url) {
      const fetched = await fetch(legacy.url);
      if (!fetched.ok) throw new Error("Could not download generated photograph");
      return Buffer.from(await fetched.arrayBuffer());
    }
  }

  if (!b64) throw new Error("Image model returned no photograph");
  return Buffer.from(b64, "base64");
}
