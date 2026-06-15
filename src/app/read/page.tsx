import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getChapters } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/lib/utils";

export default function ReadPage() {
  const chapters = getChapters();

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Reader mode</p>
          <h1 className="mt-2 text-4xl font-semibold">Read Bhagavad Gita</h1>
        </div>
        <BookOpen className="hidden h-9 w-9 text-accent sm:block" aria-hidden="true" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {chapters.map((chapter) => (
          <Link key={chapter.id} href={`/read/${chapter.chapter_number}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
              <CardHeader>
                <Badge>Chapter {chapter.chapter_number}</Badge>
                <CardTitle>{chapter.name_translation}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-muted-foreground">{chapter.name_meaning}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{truncate(chapter.chapter_summary, 230)}</p>
                <div className="mt-5 flex items-center justify-between text-sm font-medium">
                  <span>{chapter.verses_count} verses</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
