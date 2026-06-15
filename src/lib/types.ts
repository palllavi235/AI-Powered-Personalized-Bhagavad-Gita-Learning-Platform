export type Language = {
  id: number;
  language: string;
};

export type Author = {
  id: number;
  name: string;
};

export type Chapter = {
  id: number;
  chapter_number: number;
  chapter_summary: string;
  chapter_summary_hindi?: string;
  image_name?: string;
  name?: string;
  name_meaning: string;
  name_translation: string;
  name_transliterated?: string;
  verses_count: number;
};

export type Verse = {
  id: number;
  chapter_id: number;
  chapter_number: number;
  externalId?: number;
  text: string;
  title: string;
  verse_number: number;
  verse_order: number;
  transliteration: string;
  word_meanings: string;
};

export type Translation = {
  id: number;
  verse_id: number;
  verseNumber: number;
  author_id: number;
  authorName: string;
  language_id: number;
  lang: string;
  description: string;
};

export type Commentary = {
  id: number;
  verse_id: number;
  verseNumber: number;
  author_id: number;
  authorName: string;
  language_id: number;
  lang: string;
  description: string;
};

export type VerseDetail = Verse & {
  chapter?: Chapter;
  translations: Translation[];
  commentaries: Commentary[];
};

export type RetrievedSource = {
  verse: Verse;
  chapter?: Chapter;
  translations: Translation[];
  commentaries: Commentary[];
  score: number;
  similarity?: number;
  retrievalMode: "chroma" | "local";
  reason: string;
  matchedThemes: string[];
};

export type GuidanceSections = {
  understanding: string;
  gitaSuggestion: string;
  plainExplanation: string;
  practicalReflection: string;
};

export type GuidanceAnswer = {
  answer: string;
  sections: GuidanceSections;
  themes: string[];
  sources: RetrievedSource[];
  safetyNote?: string;
};
