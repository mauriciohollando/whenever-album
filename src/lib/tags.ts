export const ALBUM_TAGS = [
  "Funny",
  "Ridiculous",
  "Posed",
  "Lifestyle",
  "Candid",
  "Seasonal",
  "Journal",
  "Travel",
  "Serious",
  "Drama",
  "Tender",
  "Mythic",
  "Documentary",
  "Holiday",
  "Adventure",
  "Quiet",
  "Chaotic",
  "Formal",
  "Snapshot",
  "Epic",
] as const;

export type AlbumTag = (typeof ALBUM_TAGS)[number];

export const MAX_TAGS = 3;
