import { NextResponse } from "next/server";
import { getChapter, getVersesByChapter } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ chapterNumber: string }> }) {
  const { chapterNumber } = await params;
  const number = Number(chapterNumber);
  const chapter = getChapter(number);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }
  return NextResponse.json({ chapter, verses: getVersesByChapter(number) });
}
