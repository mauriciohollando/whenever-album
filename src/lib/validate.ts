import { z } from "zod";
import { MAX_EVENTS, MAX_MEMBERS, MAX_PHOTOS_PER_MEMBER } from "./site";
import { ALBUM_TAGS, MAX_TAGS } from "./tags";
import { windowError } from "./years";

const yearSchema = z.object({
  year: z.number().int().min(1).max(9999),
  era: z.enum(["AD", "BC"]),
});

const photoSchema = z.object({
  url: z.string().min(1),
  pathname: z.string().min(1),
});

export const draftSchema = z.object({
  members: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(600),
        photos: z.array(photoSchema).max(MAX_PHOTOS_PER_MEMBER),
      })
    )
    .min(1)
    .max(MAX_MEMBERS),
  start: yearSchema,
  end: yearSchema,
  events: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(600),
      })
    )
    .max(MAX_EVENTS),
  tags: z
    .array(z.enum(ALBUM_TAGS))
    .max(MAX_TAGS)
    .refine((tags) => new Set(tags).size === tags.length, "Duplicate tags"),
});

export function parseDraft(input: unknown) {
  const parsed = draftSchema.parse(input);
  const err = windowError(parsed.start, parsed.end);
  if (err) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["end"],
        message: err,
      },
    ]);
  }
  if (parsed.members.some((m) => m.photos.length === 0)) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["members"],
        message: "Each person needs at least one photograph.",
      },
    ]);
  }
  return parsed;
}
