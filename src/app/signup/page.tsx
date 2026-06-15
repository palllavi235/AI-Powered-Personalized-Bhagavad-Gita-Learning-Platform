import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Save your study path without storing sensitive psychological profiles.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading signup...</p>}>
            <AuthForm mode="signup" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
