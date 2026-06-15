"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StoredVerse = {
  id: number;
  chapter_number: number;
  verse_number: number;
  transliteration: string;
  chapter?: { name_translation: string };
};

export function LocalLibrary({ type }: { type: "bookmarks" | "progress" }) {
  const [items, setItems] = useState<StoredVerse[]>([]);

  useEffect(() => {
    fetch(type === "bookmarks" ? "/api/bookmarks" : "/api/progress")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setItems((data?.verses ?? []).filter(Boolean) as StoredVerse[]))
      .catch(() => setItems([]));
  }, [type]);

  if (!items.length) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-muted-foreground">{type === "bookmarks" ? "No bookmarks yet." : "No reading progress yet."}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((verse) => (
        <Link key={verse.id} href={`/verse/${verse.id}`}>
          <Card className="transition hover:bg-[#fff8df]">
            <CardHeader>
              <CardTitle className="text-base">Bhagavad Gita {verse.chapter_number}.{verse.verse_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{verse.chapter?.name_translation}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
