import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Return to your reading progress, notes, bookmarks, and guidance history.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading login...</p>}>
            <AuthForm mode="login" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
