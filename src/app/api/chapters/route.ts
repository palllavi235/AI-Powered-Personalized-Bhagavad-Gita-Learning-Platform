import { NextResponse } from "next/server";
import { getChapters } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ chapters: getChapters() });
}
