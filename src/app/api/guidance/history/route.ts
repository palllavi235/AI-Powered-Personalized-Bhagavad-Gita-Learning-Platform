import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPool, query } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!getPool() || user.id === "demo-user") return NextResponse.json({ sessions: [] });

  const result = await query<{
    id: string;
    question: string;
    created_at: string;
    answer: string | null;
    retrieved_sources: unknown;
  }>(
    `select id::text, question, answer, retrieved_sources, created_at::text
     from guidance_history
     where user_id = $1
     order by created_at desc
     limit 20`,
    [user.id]
  );

  return NextResponse.json({ sessions: result.rows });
}
