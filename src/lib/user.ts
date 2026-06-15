import "server-only";

import { getPool, query } from "@/lib/db";
import type { AuthUser } from "@/lib/auth";
import { upsertProfile } from "@/lib/profile";

export type UserPreferences = {
  reasons?: string[];
  learningMode?: string;
};

export async function getUserPreferences(
  user: AuthUser | null
): Promise<UserPreferences> {
  if (!user || user.id === "demo-user" || !getPool()) {
    return {};
  }

  const result = await query<{
    goals: string[] | null;
    learning_mode: string | null;
  }>(
    `
    select goals, learning_mode
    from user_preferences
    where user_id = $1
    `,
    [user.id]
  );

  if (!result.rows.length) {
    return {};
  }

  return {
    reasons: result.rows[0].goals ?? [],
    learningMode: result.rows[0].learning_mode ?? undefined
  };
}

export async function updateUserPreferences(
  user: AuthUser,
  preferences: UserPreferences
) {
  if (user.id === "demo-user" || !getPool()) {
    return false;
  }

  await upsertProfile(user);

  await query(
    `
    insert into user_preferences
      (user_id, goals, learning_mode)
    values
      ($1, $2, $3)
    on conflict (user_id)
    do update set
      goals = excluded.goals,
      learning_mode = excluded.learning_mode,
      updated_at = now()
    `,
    [
      user.id,
      preferences.reasons ?? [],
      preferences.learningMode ?? null
    ]
  );

  return true;
}

export async function getRecentGuidance(user: AuthUser | null) {
  if (!user || user.id === "demo-user" || !getPool()) {
    return [];
  }

  const result = await query<{
    id: string;
    question: string;
    created_at: string;
  }>(
    `
    select
      id::text,
      question,
      created_at::text
    from guidance_history
    where user_id = $1
    order by created_at desc
    limit 5
    `,
    [user.id]
  );

  return result.rows;
}