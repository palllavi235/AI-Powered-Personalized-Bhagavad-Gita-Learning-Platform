import "server-only";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoAuthAllowed } from "@/lib/supabase/config";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

const DEMO_COOKIE = "yudhsvah_demo_session";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user?.email) {
      return {
        id: user.id,
        email: user.email,
        name: readDisplayName(user.user_metadata, user.email)
      };
    }
  }

  if (isDemoAuthAllowed()) {
    const cookieStore = await cookies();
    const demoEmail = cookieStore.get(DEMO_COOKIE)?.value;
    if (demoEmail) return demoUser(demoEmail);
  }

  return null;
}

export async function setDemoSession(email: string) {
  if (!isDemoAuthAllowed()) return null;
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24
  });
  return demoUser(email);
}

export async function clearAuthSession() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

export function demoUser(email: string): AuthUser {
  return {
    id: "demo-user",
    email: email.toLowerCase(),
    name: email.split("@")[0] || "Seeker"
  };
}

function readDisplayName(metadata: unknown, email: string) {
  if (metadata && typeof metadata === "object") {
    const record = metadata as Record<string, unknown>;
    const value = record.name ?? record.full_name ?? record.display_name;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return email.split("@")[0] || "Seeker";
}
