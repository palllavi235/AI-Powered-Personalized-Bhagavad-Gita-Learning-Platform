import { NextResponse } from "next/server";
import { z } from "zod";
import { buildGuidanceAnswer } from "@/lib/retrieval";
import { getCurrentUser } from "@/lib/auth";
import { getPool, query } from "@/lib/db";
import { upsertProfile } from "@/lib/profile";

const GuidanceRequest = z.object({
  question: z.string().min(3).max(1200)
});

export async function POST(request: Request) {
  const body = GuidanceRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Please send a clear question." }, { status: 400 });
  }

  const result = await buildGuidanceAnswer(body.data.question);
  const user = await getCurrentUser();
  if (user && user.id !== "demo-user" && getPool()) {
    await upsertProfile(user);
    await query(
      `insert into guidance_history (user_id, question, answer, themes, retrieved_sources)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [user.id, body.data.question, result.answer, result.themes, JSON.stringify(result.sources)]
    );
  }
  return NextResponse.json(result);
}
