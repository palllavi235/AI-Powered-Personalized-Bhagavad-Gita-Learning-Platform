import Link from "next/link";
import { LogoutButton } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="mb-6 text-4xl font-semibold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user ? "Your account" : "Sign in"}</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2 text-muted-foreground">
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p className="text-sm">Your profile is authenticated by Supabase and personalization is stored per user.</p>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="font-medium hover:underline">Login to view your profile.</Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
