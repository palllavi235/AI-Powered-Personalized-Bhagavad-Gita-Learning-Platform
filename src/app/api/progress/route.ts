import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getPool, query } from "@/lib/db";
import { getVerseById } from "@/lib/data";
import { upsertProfile } from "@/lib/profile";

const ProgressRequest = z.object({
  verseId: z.number().int().positive()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ progress: [], verses: [] });

  const result = await query<{ verse_id: number; last_read_at: string }>(
    `select verse_id, last_read_at::text
     from progress
     where user_id = $1
     order by last_read_at desc`,
    [user.id]
  );
  return NextResponse.json({
    progress: result.rows,
    verses: result.rows.map((row) => getVerseById(row.verse_id)).filter(Boolean)
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = ProgressRequest.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "verseId is required." }, { status: 400 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ ok: true, persisted: false });
  await upsertProfile(user);

  await query(
    `insert into progress (user_id, verse_id)
     values ($1, $2)
     on conflict (user_id, verse_id)
     do update set last_read_at = now()`,
    [user.id, body.data.verseId]
  );
  return NextResponse.json({ ok: true, persisted: true });
}
