export type SupabaseConfigDiagnostics = {
  configured: boolean;
  missing: string[];
  invalid: string[];
};

export function getSupabaseConfigDiagnostics(): SupabaseConfigDiagnostics {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter((key) => !process.env[key]);
  const invalid: string[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (url) {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.endsWith(".supabase.co")) invalid.push("NEXT_PUBLIC_SUPABASE_URL must be the project URL, for example https://<project-ref>.supabase.co");
      if (parsed.pathname !== "/" && parsed.pathname !== "") invalid.push("NEXT_PUBLIC_SUPABASE_URL must not include /rest/v1, /auth, or any path.");
    } catch {
      invalid.push("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
    }
  }

  return {
    configured: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
}

export function hasSupabaseConfig() {
  return getSupabaseConfigDiagnostics().configured;
}

export function isDemoAuthAllowed() {
  return process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";
}
