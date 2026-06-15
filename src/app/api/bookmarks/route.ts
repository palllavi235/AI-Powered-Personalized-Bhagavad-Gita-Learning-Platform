import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getPool, query } from "@/lib/db";
import { getVerseById } from "@/lib/data";
import { upsertProfile } from "@/lib/profile";

const BookmarkRequest = z.object({
  verseId: z.number().int().positive()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ bookmarks: [], verses: [] });

  const result = await query<{ verse_id: number }>("select verse_id from bookmarks where user_id = $1", [user.id]);
  const bookmarks = result.rows.map((item) => item.verse_id);
  return NextResponse.json({
    bookmarks,
    verses: bookmarks.map((id) => getVerseById(id)).filter(Boolean)
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = BookmarkRequest.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "verseId is required." }, { status: 400 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ ok: true, persisted: false });
  await upsertProfile(user);

  await query(
    `insert into bookmarks (user_id, verse_id)
     values ($1, $2)
     on conflict (user_id, verse_id) do nothing`,
    [user.id, body.data.verseId]
  );
  return NextResponse.json({ ok: true, persisted: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = BookmarkRequest.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "verseId is required." }, { status: 400 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ ok: true, persisted: false });
  await upsertProfile(user);

  await query("delete from bookmarks where user_id = $1 and verse_id = $2", [user.id, body.data.verseId]);
  return NextResponse.json({ ok: true, persisted: true });
}
