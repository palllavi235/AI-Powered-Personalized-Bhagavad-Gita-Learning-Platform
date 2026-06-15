import Link from "next/link";
import { BookOpen, Compass, Flame, UserCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth-form";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/read", label: "Read" },
  { href: "/guidance", label: "Guidance" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/progress", label: "Progress" }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-[#fff9e8]/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              YUDHSVAH
              <span className="block text-xs font-normal text-muted-foreground">Fight Within</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/read" className="hidden rounded-md border border-border bg-card px-3 py-2 text-sm sm:inline-flex">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Read
            </Link>
            {user ? (
              <>
                <Link href="/profile" className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm sm:inline-flex">
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-28 truncate">{user.name}</span>
                </Link>
                <LogoutButton compact />
              </>
            ) : (
              <Link href="/login" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                <Compass className="mr-2 inline h-4 w-4" aria-hidden="true" />
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
