import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, setDemoSession } from "@/lib/auth";
import { upsertProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getSupabaseConfigDiagnostics,
  hasSupabaseConfig,
  isDemoAuthAllowed
} from "@/lib/supabase/config";

const RegisterRequest = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(160)
});

export async function POST(request: Request) {
  try {
    const body = RegisterRequest.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json(
        {
          error:
            "Name, valid email, and 8+ character password are required."
        },
        { status: 400 }
      );
    }

    const { name, email, password } = body.data;

    console.log("REGISTER ATTEMPT:", email);

    if (!hasSupabaseConfig()) {
      console.error(
        "SUPABASE CONFIG ERROR:",
        getSupabaseConfigDiagnostics()
      );

      if (!isDemoAuthAllowed()) {
        return NextResponse.json(
          {
            error: "Supabase Auth is not configured.",
            diagnostics: getSupabaseConfigDiagnostics()
          },
          { status: 500 }
        );
      }

      const user = await setDemoSession(email);

      return NextResponse.json({
        user: user ? { ...user, name } : null,
        demo: true
      });
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      console.error("SUPABASE SIGNUP ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
          details: error
        },
        { status: 400 }
      );
    }

    console.log("SIGNUP SUCCESS:", data);

    const user = await getCurrentUser();

    if (user) {
      try {
        await upsertProfile({
          ...user,
          name
        });
      } catch (profileError) {
        console.error(
          "PROFILE UPSERT ERROR:",
          profileError
        );
      }
    }

    return NextResponse.json({
      user,
      session: data.session,
      message: user
        ? undefined
        : "Check your email to confirm your account."
    });
  } catch (err) {
    console.error("REGISTER ROUTE CRASH:", err);

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}
