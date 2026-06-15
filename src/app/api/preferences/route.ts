import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserPreferences, updateUserPreferences } from "@/lib/user";

const PreferencesRequest = z.object({
  reasons: z.array(z.string()).max(8).optional(),
  learningMode: z.string().max(80).optional()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  return NextResponse.json({ preferences: await getUserPreferences(user) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = PreferencesRequest.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });

  const persisted = await updateUserPreferences(user, body.data);
  return NextResponse.json({ ok: true, persisted });
}
