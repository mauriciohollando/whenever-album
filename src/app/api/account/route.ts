import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { loadUserAlbums } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const albums = await loadUserAlbums(user);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      editCredits: user.editCredits,
      purchases: user.purchases,
      createdAt: user.createdAt,
    },
    albums,
  });
}
