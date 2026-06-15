import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getPool, query } from "@/lib/db";
import { getVerseById } from "@/lib/data";
import { upsertProfile } from "@/lib/profile";

const NoteRequest = z.object({
  verseId: z.number().int().positive(),
  note: z.string().max(4000)
});

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ notes: [] });

  const url = new URL(request.url);
  const verseId = Number(url.searchParams.get("verseId"));
  const result = Number.isFinite(verseId) && verseId > 0
    ? await query<{ id: string; verse_id: number; note: string; updated_at: string }>(
        "select id::text, verse_id, note, updated_at::text from notes where user_id = $1 and verse_id = $2 order by updated_at desc limit 1",
        [user.id, verseId]
      )
    : await query<{ id: string; verse_id: number; note: string; updated_at: string }>(
        "select id::text, verse_id, note, updated_at::text from notes where user_id = $1 order by updated_at desc",
        [user.id]
      );

  return NextResponse.json({
    notes: result.rows.map((row) => ({ ...row, verse: getVerseById(row.verse_id) }))
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = NoteRequest.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "A verse and note are required." }, { status: 400 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ ok: true, persisted: false });
  await upsertProfile(user);

  await query(
    `insert into notes (user_id, verse_id, note)
     values ($1, $2, $3)
     on conflict (user_id, verse_id) do update set
       note = excluded.note,
       updated_at = now()`,
    [user.id, body.data.verseId, body.data.note]
  );
  return NextResponse.json({ ok: true, persisted: true });
}
