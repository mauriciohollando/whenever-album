export type Era = "AD" | "BC";

export type AlbumYear = {
  year: number;
  era: Era;
};

export type MemberPhoto = {
  url: string;
  pathname: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  description: string;
  photos: MemberPhoto[];
};

export type AlbumEvent = {
  id: string;
  name: string;
  description: string;
};

export type AlbumPhoto = {
  id: string;
  title: string;
  description: string;
  yearLabel: string;
  imageUrl: string | null;
  members: string[];
};

export type AlbumPage = {
  index: number;
  heading: string;
  photos: AlbumPhoto[];
};

export type AlbumStatus =
  | "draft"
  | "paid"
  | "planning"
  | "generating"
  | "ready"
  | "failed";

export type Album = {
  id: string;
  tokenHash: string;
  email: string | null;
  status: AlbumStatus;
  members: FamilyMember[];
  start: AlbumYear;
  end: AlbumYear;
  events: AlbumEvent[];
  tags: string[];
  pages: AlbumPage[];
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type PublicAlbum = Omit<Album, "tokenHash">;

export type AlbumDraftInput = {
  members: FamilyMember[];
  start: AlbumYear;
  end: AlbumYear;
  events: AlbumEvent[];
  tags: string[];
};
