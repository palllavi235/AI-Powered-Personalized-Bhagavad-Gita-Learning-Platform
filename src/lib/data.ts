import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { Author, Chapter, Commentary, Language, Translation, Verse, VerseDetail } from "@/lib/types";

type Dataset = {
  authors: Author[];
  chapters: Chapter[];
  commentaries: Commentary[];
  languages: Language[];
  translations: Translation[];
  verses: Verse[];
};

let datasetCache: Dataset | null = null;

function readJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "DATA", "ROW_Data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getDataset(): Dataset {
  if (datasetCache) return datasetCache;

  datasetCache = {
    authors: readJson<Author[]>("authors.json"),
    chapters: readJson<Chapter[]>("chapters.json"),
    commentaries: readJson<Commentary[]>("commentary.json"),
    languages: readJson<Language[]>("languages.json"),
    translations: readJson<Translation[]>("translation.json"),
    verses: readJson<Verse[]>("verse.json")
  };

  return datasetCache;
}

export function getChapters() {
  return [...getDataset().chapters].sort((a, b) => a.chapter_number - b.chapter_number);
}

export function getChapter(chapterNumber: number) {
  return getDataset().chapters.find((chapter) => chapter.chapter_number === chapterNumber);
}

export function getVersesByChapter(chapterNumber: number) {
  return getDataset()
    .verses.filter((verse) => verse.chapter_number === chapterNumber)
    .sort((a, b) => a.verse_number - b.verse_number);
}

export function getVerseById(id: number): VerseDetail | null {
  const data = getDataset();
  const verse = data.verses.find((item) => item.id === id);
  if (!verse) return null;

  return {
    ...verse,
    chapter: data.chapters.find((chapter) => chapter.chapter_number === verse.chapter_number),
    translations: data.translations
      .filter((translation) => translation.verse_id === verse.id)
      .sort(sortEnglishFirst),
    commentaries: data.commentaries
      .filter((commentary) => commentary.verse_id === verse.id)
      .sort(sortEnglishFirst)
  };
}

export function getVerseByReference(chapterNumber: number, verseNumber: number) {
  const verse = getDataset().verses.find(
    (item) => item.chapter_number === chapterNumber && item.verse_number === verseNumber
  );
  return verse ? getVerseById(verse.id) : null;
}

export function searchVerses(query: string, limit = 30) {
  const terms = tokenize(query);
  if (!terms.length) return [];

  return getDataset()
    .verses.map((verse) => {
      const detail = getVerseById(verse.id);
      const haystack = [
        verse.text,
        verse.transliteration,
        verse.word_meanings,
        ...(detail?.translations ?? []).map((item) => item.description),
        ...(detail?.commentaries ?? []).slice(0, 4).map((item) => item.description)
      ].join(" ");
      return { verse, score: scoreText(haystack, terms) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => getVerseById(item.verse.id))
    .filter(Boolean) as VerseDetail[];
}

export function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
}

export function scoreText(text: string, terms: string[]) {
  const haystack = text.toLowerCase();
  return terms.reduce((score, term) => {
    const occurrences = haystack.split(term).length - 1;
    return score + occurrences * (term.length > 5 ? 2 : 1);
  }, 0);
}

function sortEnglishFirst<T extends { lang: string; authorName?: string }>(a: T, b: T) {
  if (a.lang === "english" && b.lang !== "english") return -1;
  if (a.lang !== "english" && b.lang === "english") return 1;
  return (a.authorName ?? "").localeCompare(b.authorName ?? "");
}
