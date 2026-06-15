"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Bookmark, MessageCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Preferences = {
  reasons?: string[];
  learningMode?: string;
};

type VerseResult = {
  id: number;
  chapter_number: number;
  verse_number: number;
  chapter?: { name_translation: string };
};

type GuidanceItem = {
  question: string;
  created_at: string;
};

const reasonQuery: Record<string, string> = {
  Discipline: "discipline practice self control",
  "Career & Purpose": "duty work purpose",
  "Anxiety & Overthinking": "mind fear worry",
  Relationships: "attachment compassion conflict",
  "Self Growth": "self control wisdom",
  "Spiritual Learning": "knowledge devotion",
  "Daily Bhagavad Gita Study": "yoga knowledge action"
};

export function PersonalDashboard() {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [recentGuidance, setRecentGuidance] = useState<GuidanceItem[]>([]);
  const [bookmarks, setBookmarks] = useState<VerseResult[]>([]);
  const [progress, setProgress] = useState<VerseResult[]>([]);
  const [recommended, setRecommended] = useState<VerseResult[]>([]);

  const query = useMemo(() => {
    const firstReason = preferences.reasons?.find((reason) => reasonQuery[reason]);
    return firstReason ? reasonQuery[firstReason] : "mind discipline action wisdom";
  }, [preferences.reasons]);

  useEffect(() => {
    fetch("/api/preferences")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setPreferences(data?.preferences ?? {}))
      .catch(() => setPreferences({}));
    fetch("/api/guidance/history")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setRecentGuidance(data?.sessions ?? []))
      .catch(() => setRecentGuidance([]));
    fetch("/api/bookmarks")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setBookmarks(data?.verses ?? []))
      .catch(() => setBookmarks([]));
    fetch("/api/progress")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setProgress(data?.verses ?? []))
      .catch(() => setProgress([]));
  }, []);

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => setRecommended((data.results ?? []).slice(0, 3)))
      .catch(() => undefined);
  }, [query]);

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>Reading progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{progress.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">verses opened by your account</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Bookmark className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>Bookmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{bookmarks.length}</p>
          <Link href="/bookmarks" className="mt-3 inline-block">
            <Button variant="secondary">Open bookmarks</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <MessageCircle className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>Recent guidance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentGuidance.length ? (
            <div className="space-y-2">
              {recentGuidance.slice(0, 3).map((item) => (
                <p key={`${item.created_at}-${item.question}`} className="text-sm text-muted-foreground">{item.question}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No saved guidance yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>Recommended verses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {recommended.map((verse) => (
            <Link key={verse.id} href={`/verse/${verse.id}`} className="rounded-md border border-border bg-card p-4 hover:bg-muted">
              <p className="font-medium">Bhagavad Gita {verse.chapter_number}.{verse.verse_number}</p>
              <p className="mt-2 text-sm text-muted-foreground">{verse.chapter?.name_translation}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
