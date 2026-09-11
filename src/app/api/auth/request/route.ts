import { NextResponse } from "next/server";
import { createLoginToken, emailLooksOk, normalizeEmail } from "@/lib/auth";
import { emailConfigured, loginUrl, sendLoginEmail } from "@/lib/email";
import { upsertUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = normalizeEmail(String(body.email || ""));
  if (!emailLooksOk(email)) {
    return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
  }

  await upsertUserByEmail(email);
  const token = await createLoginToken(email);
  const url = loginUrl(token);

  if (emailConfigured()) {
    await sendLoginEmail(email, url);
    return NextResponse.json({ ok: true, emailed: true });
  }

  const dev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    ok: true,
    emailed: false,
    message: dev
      ? "Email sending is not configured. Use this link on this computer."
      : "We could not email you. Open an album link from checkout to sign back in.",
    loginUrl: dev ? url : undefined,
  });
}
