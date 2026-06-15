import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getVerseById } from "@/lib/data";
import { VerseActions } from "@/components/verse-actions";
import { VerseSourceTabs } from "@/components/verse-source-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verseRef } from "@/lib/utils";

export default async function VersePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const foundVerse = getVerseById(Number(id));
  if (!foundVerse) notFound();
  const verse = foundVerse;

  return (
    <div className="container-page py-10">
      <Link href={`/read/${verse.chapter_number}`} className="mb-5 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Back to chapter {verse.chapter_number}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>Bhagavad Gita {verseRef(verse.chapter_number, verse.verse_number)}</Badge>
              <CardTitle className="text-3xl">{verse.chapter?.name_translation}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sanskrit</h2>
                <p className="mt-3 whitespace-pre-line text-xl leading-9">{verse.text}</p>
              </section>
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Transliteration</h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{verse.transliteration}</p>
              </section>
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Word Meanings</h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{verse.word_meanings}</p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <VerseSourceTabs
                verseId={verse.id}
                reference={verseRef(verse.chapter_number, verse.verse_number)}
                translations={verse.translations}
                commentaries={verse.commentaries}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Study tools</CardTitle>
            </CardHeader>
            <CardContent>
              <VerseActions verseId={verse.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
