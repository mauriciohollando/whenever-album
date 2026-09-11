import { put as blobPut, list as blobList } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Album, PublicAlbum } from "./types";

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

function onVercel(): boolean {
  return process.env.VERCEL === "1" || !!process.env.VERCEL_URL;
}

function albumPath(id: string): string {
  return `albums/${id}/album.json`;
}

export function toPublicAlbum(album: Album): PublicAlbum {
  const { tokenHash: _tokenHash, merchDrafts: _drafts, pendingCreditToken: _pending, ...rest } = album;
  return rest;
}

export async function saveJson(pathname: string, data: unknown): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  const safe = pathname.replace(/^\/+/, "").replace(/\.\.+/g, "");

  if (isBlobConfigured()) {
    await blobPut(safe, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  if (onVercel()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing on Vercel.");
  }

  const file = path.join(process.cwd(), ".data", safe);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
}

export async function loadJson<T>(pathname: string): Promise<T | null> {
  const safe = pathname.replace(/^\/+/, "").replace(/\.\.+/g, "");

  if (isBlobConfigured()) {
    const listed = await blobList({ prefix: safe, limit: 1 });
    const found = listed.blobs.find((b) => b.pathname === safe);
    if (!found) return null;
    const res = await fetch(found.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  }

  if (onVercel()) return null;

  try {
    const file = path.join(process.cwd(), ".data", safe);
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveAlbum(album: Album): Promise<void> {
  const body = JSON.stringify(album, null, 2);
  const pathname = albumPath(album.id);

  if (isBlobConfigured()) {
    await blobPut(pathname, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  if (onVercel()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing on Vercel.");
  }

  const file = path.join(process.cwd(), ".data", pathname);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
}

export async function loadAlbum(id: string): Promise<Album | null> {
  const pathname = albumPath(id);

  if (isBlobConfigured()) {
    const listed = await blobList({ prefix: pathname, limit: 1 });
    const found = listed.blobs.find((b) => b.pathname === pathname);
    if (!found) return null;
    const res = await fetch(found.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Album;
  }

  if (onVercel()) return null;

  try {
    const file = path.join(process.cwd(), ".data", pathname);
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as Album;
  } catch {
    return null;
  }
}

export async function storeBinary(
  pathname: string,
  body: Buffer,
  contentType: string
): Promise<{ url: string; pathname: string }> {
  const safe = pathname.replace(/^\/+/, "").replace(/\.\.+/g, "");

  if (isBlobConfigured()) {
    const res = await blobPut(safe, body, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { url: res.url, pathname: safe };
  }

  if (onVercel()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing on Vercel.");
  }

  const file = path.join(process.cwd(), "public", safe);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return { url: `/${safe}`, pathname: safe };
}
