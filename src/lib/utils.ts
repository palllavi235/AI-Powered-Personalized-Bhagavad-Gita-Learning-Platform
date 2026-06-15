import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(text: string | null | undefined, length = 220) {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > length ? `${normalized.slice(0, length).trim()}...` : normalized;
}

export function verseRef(chapterNumber: number, verseNumber: number) {
  return `${chapterNumber}.${verseNumber}`;
}
