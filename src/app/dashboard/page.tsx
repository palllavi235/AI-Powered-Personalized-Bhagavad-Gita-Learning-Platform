import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Compass, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getChapters, getVerseByReference } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { verseRef } from "@/lib/utils";
import { getUserPreferences } from "@/lib/user";
import { PersonalDashboard } from "@/components/personal-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const preferences = await getUserPreferences(user);
  if (user && !preferences.learningMode) redirect("/onboarding");
  const chapters = getChapters();
  const continueVerse = getVerseByReference(2, 47);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Welcome {user?.name ?? "Seeker"}</p>
        <h1 className="mt-2 text-4xl font-semibold">Your inner clarity workspace.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {preferences.learningMode
            ? `Learning mode: ${preferences.learningMode}.`
            : "Set your learning preferences to make this dashboard feel more personal."}
        </p>
        {!preferences.learningMode && (
          <Link href="/onboarding" className="mt-4 inline-block">
            <Button variant="secondary">Personalize dashboard</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/read">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
            <CardHeader>
              <BookOpen className="h-6 w-6 text-accent" aria-hidden="true" />
              <CardTitle>Read Bhagavad Gita</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">Browse all {chapters.length} chapters with verses, translations, word meanings, and commentaries.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/guidance">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
            <CardHeader>
              <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
              <CardTitle>Seek Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">Ask about an inner battle and receive a dataset-grounded answer with cited sources.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <History className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle>Continue reading</CardTitle>
          </CardHeader>
          <CardContent>
            {continueVerse && (
              <>
                <p className="text-sm text-muted-foreground">Bhagavad Gita {verseRef(continueVerse.chapter_number, continueVerse.verse_number)}</p>
                <p className="mt-2 font-medium">{continueVerse.chapter?.name_translation}</p>
                <Link href={`/verse/${continueVerse.id}`} className="mt-4 inline-block">
                  <Button variant="secondary">Open verse</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              What is one action you can take today without clinging to the result?
            </p>
          </CardContent>
        </Card>
      </div>
      <PersonalDashboard />
    </div>
  );
}
