import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfigDiagnostics } from "@/lib/supabase/config";

const protectedRoutes = [
  "/dashboard",
  "/bookmarks",
  "/progress",
  "/onboarding",
  "/guidance/history",
  "/api/bookmarks",
  "/api/notes",
  "/api/progress",
  "/api/preferences",
  "/api/guidance/history"
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const hasSupabaseConfig = getSupabaseConfigDiagnostics().configured;
  const isDemoAllowed = process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";

  let hasUser = false;
  if (hasSupabaseConfig) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          }
        }
      }
    );

    const {
      data: { user }
    } = await supabase.auth.getUser();
    hasUser = Boolean(user);
  }

  if (!hasUser && isDemoAllowed) {
    hasUser = request.cookies.has("yudhsvah_demo_session");
  }

  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!isProtected) return response;

  if (!hasUser) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookmarks/:path*",
    "/progress/:path*",
    "/onboarding/:path*",
    "/guidance/history/:path*",
    "/api/bookmarks/:path*",
    "/api/notes/:path*",
    "/api/progress/:path*",
    "/api/preferences/:path*",
    "/api/guidance/history/:path*"
  ]
};
