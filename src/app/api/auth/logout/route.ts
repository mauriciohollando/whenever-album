import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { siteOrigin } from "@/lib/site";

export const runtime = "nodejs";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(`${siteOrigin()}/account`);
}

export async function GET() {
  await clearSession();
  return NextResponse.redirect(`${siteOrigin()}/account`);
}
