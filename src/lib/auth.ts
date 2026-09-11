import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { loadJson, saveJson } from "./store";
import { createAlbumToken, hashToken } from "./token";
import { loadUser, type PublicUser } from "./users";

export const SESSION_COOKIE = "whenever_session";
const WEEK = 60 * 60 * 24 * 7;
const MAX_AGE = WEEK * 4;

export type Session = {
  userId: string;
  email: string;
  exp: number;
};

function secret(): string {
  return process.env.ALBUM_TOKEN_SECRET?.trim() || "dev-whenever-secret";
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function signSession(userId: string, email: string): string {
  const session: Session = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const payload = encode(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifySession(raw?: string | null): Session | null {
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(decode(payload)) as Session;
    if (!session.userId || !session.email || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const session = await readSession();
  if (!session) return null;
  return loadUser(session.userId);
}

export async function writeSession(userId: string, email: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(userId, email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function emailLooksOk(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

type LoginChallenge = {
  email: string;
  exp: number;
};

export async function createLoginToken(email: string): Promise<string> {
  const token = createAlbumToken();
  await saveJson(`logins/${hashToken(token)}.json`, {
    email,
    exp: Date.now() + 60 * 60 * 1000,
  } satisfies LoginChallenge);
  return token;
}

export async function consumeLoginToken(token: string): Promise<string | null> {
  const found = await loadJson<LoginChallenge>(`logins/${hashToken(token)}.json`);
  if (!found || found.exp < Date.now()) return null;
  return found.email;
}
