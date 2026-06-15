import { NextResponse } from "next/server";
import { searchVerses } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  return NextResponse.json({ results: searchVerses(q) });
}
