import "server-only";

import { getPool, query } from "@/lib/db";
import type { AuthUser } from "@/lib/auth";

export async function upsertProfile(user: AuthUser) {
  if (!getPool() || user.id === "demo-user") return false;
  await query(
    `insert into profiles (id, name, email)
     values ($1, $2, lower($3))
     on conflict (id) do update set
       name = excluded.name,
       email = excluded.email,
       updated_at = now()`,
    [user.id, user.name, user.email]
  );
  return true;
}
