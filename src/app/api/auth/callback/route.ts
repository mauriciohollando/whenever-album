import { NextResponse } from "next/server";
import { consumeLoginToken, writeSession } from "@/lib/auth";
import { siteOrigin } from "@/lib/site";
import { upsertUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const email = await consumeLoginToken(token);
  if (!email) {
    return NextResponse.redirect(`${siteOrigin()}/account?error=expired`);
  }
  const user = await upsertUserByEmail(email);
  await writeSession(user.id, user.email);
  return NextResponse.redirect(`${siteOrigin()}/account`);
}
