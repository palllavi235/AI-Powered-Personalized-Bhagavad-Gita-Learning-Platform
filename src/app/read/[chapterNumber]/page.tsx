import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getChapter, getVersesByChapter } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncate, verseRef } from "@/lib/utils";

export default async function ChapterPage({ params }: { params: Promise<{ chapterNumber: string }> }) {
  const { chapterNumber } = await params;
  const foundChapter = getChapter(Number(chapterNumber));
  if (!foundChapter) notFound();
  const chapter = foundChapter;
  const verses = getVersesByChapter(chapter.chapter_number);

  return (
    <div className="container-page py-10">
      <Link href="/read" className="mb-5 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        All chapters
      </Link>
      <div className="mb-8">
        <Badge>Chapter {chapter.chapter_number}</Badge>
        <h1 className="mt-3 text-4xl font-semibold">{chapter.name_translation}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{chapter.name_meaning}</p>
        <p className="mt-5 max-w-4xl leading-7 text-muted-foreground">{chapter.chapter_summary}</p>
      </div>
      <div className="grid gap-3">
        {verses.map((verse) => (
          <Link key={verse.id} href={`/verse/${verse.id}`}>
            <Card className="transition hover:bg-[#fff8df]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bhagavad Gita {verseRef(verse.chapter_number, verse.verse_number)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{truncate(verse.transliteration || verse.word_meanings, 190)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
