import { OnboardingForm } from "@/components/onboarding-form";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserPreferences } from "@/lib/user";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  const preferences = await getUserPreferences(user);
  if (user && preferences.learningMode) redirect("/dashboard");

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Personalize your path</p>
        <h1 className="mt-2 text-4xl font-semibold">Begin with intention.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          These preferences shape your dashboard and recommendations. They are learning preferences, not a psychological profile.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
