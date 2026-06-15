import { NextResponse } from "next/server";
import { getVerseById } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const verse = getVerseById(Number(id));
  if (!verse) {
    return NextResponse.json({ error: "Verse not found." }, { status: 404 });
  }
  return NextResponse.json({ verse });
}
