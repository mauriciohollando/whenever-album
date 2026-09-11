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

export type PhotoVersionKind = "original" | "redo";

export type PhotoVersion = {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  kind: PhotoVersionKind;
};

export type AlbumPhoto = {
  id: string;
  title: string;
  description: string;
  yearLabel: string;
  imageUrl: string | null;
  members: string[];
  versions?: PhotoVersion[];
  selectedVersionId?: string;
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

export type PrintFinish = "softcover" | "hardcover";

export type FulfillmentStatus = "pending" | "submitted" | "shipped" | "failed" | "refunded";

export type ShippingAddress = {
  name: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal: string;
  country: string;
};

export type PrintOrder = {
  id: string;
  finish: PrintFinish;
  status: FulfillmentStatus;
  shipping: ShippingAddress | null;
  prodigiOrderId?: string;
  trackingUrl?: string;
  interiorUrl?: string;
  coverUrl?: string;
  error?: string;
};

export type MerchSku = "tee" | "hoodie" | "mug" | "poster";

export type PhotoCrop = {
  x: number;
  y: number;
  zoom: number;
};

export type MerchDraft = {
  id: string;
  sku: MerchSku;
  photoId: string;
  color: string;
  size: string;
  crop: PhotoCrop;
  artUrl: string;
  country: string;
};

export type MerchOrder = {
  id: string;
  sku: MerchSku;
  photoId: string;
  color: string;
  size: string;
  artUrl: string;
  status: FulfillmentStatus;
  shipping: ShippingAddress | null;
  printfulId?: number;
  trackingUrl?: string;
  error?: string;
  createdAt: string;
};

export type PurchaseKind = "digital" | "hardcover" | "softcover" | "merch" | "extra_album";

export type Purchase = {
  id: string;
  kind: PurchaseKind;
  albumId: string;
  label: string;
  amountUsd: number;
  creditsGranted: number;
  createdAt: string;
  stripeSessionId?: string;
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  editCredits: number;
  albumIds: string[];
  purchases: Purchase[];
};

export type Album = {
  id: string;
  tokenHash: string;
  email: string | null;
  userId?: string;
  pendingEditCredits?: number;
  recordedPurchaseKeys?: string[];
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
  printOrder?: PrintOrder;
  merchOrders?: MerchOrder[];
  merchDrafts?: Record<string, MerchDraft>;
  extraAlbumToken?: string;
  extraAlbumRemaining?: number;
  paidWithCredit?: boolean;
  pendingCreditToken?: string;
};

export type PublicAlbum = Omit<
  Album,
  "tokenHash" | "merchDrafts" | "pendingCreditToken" | "recordedPurchaseKeys"
>;

export type AlbumDraftInput = {
  members: FamilyMember[];
  start: AlbumYear;
  end: AlbumYear;
  events: AlbumEvent[];
  tags: string[];
};

export type GiftCredit = {
  id: string;
  tokenHash: string;
  remaining: number;
  email: string | null;
  sourceAlbumId: string;
  createdAt: string;
};
