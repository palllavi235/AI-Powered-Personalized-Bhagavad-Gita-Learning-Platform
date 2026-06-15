import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, setDemoSession } from "@/lib/auth";
import { upsertProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfigDiagnostics, hasSupabaseConfig, isDemoAuthAllowed } from "@/lib/supabase/config";

const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = LoginRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    if (!isDemoAuthAllowed()) {
      return NextResponse.json(
        { error: "Supabase Auth is not configured.", diagnostics: getSupabaseConfigDiagnostics() },
        { status: 500 }
      );
    }
    const user = await setDemoSession(body.data.email);
    return NextResponse.json({ user, demo: true });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase!.auth.signInWithPassword(body.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const user = await getCurrentUser();
  if (user) await upsertProfile(user);
  return NextResponse.json({ user });
}
