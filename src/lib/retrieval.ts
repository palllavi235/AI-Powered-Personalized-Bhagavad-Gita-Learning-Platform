import "server-only";

import { getDataset, getVerseById, scoreText, tokenize } from "@/lib/data";
import type { GuidanceAnswer, RetrievedSource, VerseDetail } from "@/lib/types";
import { truncate, verseRef } from "@/lib/utils";

const CONCERN_LEXICON: Record<string, string[]> = {
  anxiety: ["anxiety", "anxious", "fear", "afraid", "worry", "panic", "nervous", "uncertain"],
  failure: ["failure", "fail", "failed", "outcome", "result", "defeat", "fruits", "action", "attachment", "inaction", "equanimity", "karma", "work"],
  mind: ["mind", "thoughts", "restless", "control", "focus", "concentration", "meditation"],
  discipline: ["discipline", "habit", "practice", "effort", "lazy", "routine", "self-control"],
  grief: ["grief", "loss", "death", "sorrow", "mourning", "impermanent", "body", "soul", "eternal", "birth", "rebirth", "embodied", "transient"],
  jealousy: ["jealous", "jealousy", "envy", "comparison", "ego", "desire", "attachment"],
  purpose: ["purpose", "meaning", "lost", "direction", "duty", "work", "calling"],
  relationships: ["relationship", "family", "friend", "attachment", "conflict", "love"],
  anger: ["anger", "angry", "rage", "desire", "resentment", "impulse"]
};

const CRISIS_TERMS = ["suicide", "kill myself", "self harm", "hurt myself", "end my life"];
const BROAD_DIRECT_TERMS = new Set(["cannot", "couldnt", "wouldnt", "shouldnt", "loss", "success", "someone"]);

export async function buildGuidanceAnswer(question: string): Promise<GuidanceAnswer> {
  const themes = detectThemes(question);
  const sources = await retrieveSources(question, themes);
  logRetrieval(question, sources);

  if (containsCrisisLanguage(question)) {
    return {
      answer:
        "I found source material that may be relevant, but this message also sounds potentially urgent. Please use the safety note first; the cited sources below are for reflection only.",
      sections: emptySections("This may be urgent, so immediate safety comes first."),
      themes,
      sources,
      safetyNote:
        "If you may harm yourself or someone else, contact local emergency services or a trusted person immediately. YUDHSVAH can reflect on source texts, but it is not crisis care."
    };
  }

  if (!sources.length) {
    return {
      answer:
        "I could not find enough source material in the dataset to answer that responsibly. Try asking with a concrete struggle such as fear, discipline, attachment to results, anger, comparison, or purpose.",
      sections: emptySections("I could not find enough relevant source material in the dataset."),
      themes,
      sources
    };
  }

  const composed = composeGroundedAnswer(question, themes, sources);
  return {
    answer: composed.answer,
    sections: composed.sections,
    themes,
    sources
  };
}

export async function retrieveSources(question: string, themes = detectThemes(question), limit = 4) {
  const vectorMatches = await retrieveFromChroma(question).catch(() => []);
  const localMatches = retrieveLocally(question, themes);
  const all = [...vectorMatches, ...localMatches];
  const byVerse = new Map<number, RetrievedSource>();

  for (const source of all) {
    const current = byVerse.get(source.verse.id);
    if (!current || source.score > current.score) byVerse.set(source.verse.id, source);
  }

  return [...byVerse.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

function retrieveLocally(question: string, themes: string[]) {
  const data = getDataset();
  const directTerms = tokenize(question).filter((term) => !BROAD_DIRECT_TERMS.has(term));
  const expandedTerms = buildExpandedTerms(question, themes);

  return data.verses
    .map((verse) => {
    const detail = getVerseById(verse.id);
      const translations = detail?.translations.filter((translation) => translation.lang === "english") ?? [];
      const commentaries = detail?.commentaries.filter((commentary) => commentary.lang === "english") ?? [];
      const translationScore = maxFieldScore(
        translations.map((translation) => translation.description),
        directTerms,
        expandedTerms
      ) * 22;
      const commentaryScore = maxFieldScore(
        commentaries.slice(0, 8).map((commentary) => commentary.description),
        directTerms,
        expandedTerms
      ) * 8;
      const verseScore = weightedFieldScore(
        [verse.transliteration, verse.word_meanings, detail?.chapter?.chapter_summary ?? ""].join(" "),
        directTerms,
        expandedTerms
      ) * 5;
      const phraseScore = Math.max(
        ...translations.map((translation) => phraseOverlap(translation.description, question)),
        ...commentaries.slice(0, 4).map((commentary) => phraseOverlap(commentary.description, question)),
        0
      ) * 10;
      const score = translationScore + commentaryScore + verseScore + phraseScore;
      return sourceFromVerseDetail(detail, score, themes, "local", "Dynamic lexical similarity across verses, translations, commentaries, and chapter summaries.");
    })
    .filter((source): source is RetrievedSource => source !== null && source.score > 0)
    .sort((a, b) => b.score - a.score);
}

function maxFieldScore(fields: string[], directTerms: string[], expandedTerms: string[]) {
  return Math.max(0, ...fields.map((field) => weightedFieldScore(field, directTerms, expandedTerms)));
}

function weightedFieldScore(field: string, directTerms: string[], expandedTerms: string[]) {
  const tokenCount = Math.max(6, tokenize(field).length);
  const direct = scoreText(field, directTerms) * 2.8;
  const expanded = scoreText(field, expandedTerms);
  return (direct + expanded) / Math.sqrt(tokenCount);
}

async function retrieveFromChroma(question: string): Promise<RetrievedSource[]> {
  const chromaHost = process.env.CHROMA_HOST;
  const embedUrl = process.env.EMBEDDINGS_API_URL;
  const collection = process.env.CHROMA_COLLECTION ?? "yudhsvah_gita";

  if (!chromaHost || !embedUrl) return [];

  const embeddingResponse = await fetch(embedUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: question })
  });
  if (!embeddingResponse.ok) return [];
  const { embedding } = (await embeddingResponse.json()) as { embedding?: number[] };
  if (!embedding?.length) return [];

  const baseUrl = chromaHost.replace(/\/$/, "");
  const collectionId = await resolveChromaCollectionId(baseUrl, collection);
  if (!collectionId) return [];

  const response = await fetch(`${baseUrl}/api/v1/collections/${collectionId}/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query_embeddings: [embedding],
      n_results: 6,
      include: ["metadatas", "distances"]
    })
  });
  if (!response.ok) return [];

  const payload = (await response.json()) as {
    metadatas?: Array<Array<{ verse_id?: number; themes?: string }>>;
    distances?: number[][];
  };

  return (payload.metadatas?.[0] ?? [])
    .map((metadata, index) =>
      sourceFromVerseDetail(
        metadata.verse_id ? getVerseById(metadata.verse_id) : null,
        Math.max(0, 100 - (payload.distances?.[0]?.[index] ?? 1) * 100),
        metadata.themes?.split(",").filter(Boolean) ?? [],
        "chroma",
        "Chroma vector similarity using Sentence Transformers embeddings.",
        1 - (payload.distances?.[0]?.[index] ?? 1)
      )
    )
    .filter((source): source is RetrievedSource => source !== null);
}

async function resolveChromaCollectionId(baseUrl: string, collection: string) {
  const direct = await fetch(`${baseUrl}/api/v1/collections/${collection}`).catch(() => null);
  if (direct?.ok) {
    const payload = (await direct.json()) as { id?: string; name?: string };
    return payload.id ?? payload.name ?? collection;
  }
  return collection;
}

function sourceFromVerseDetail(
  detail: VerseDetail | null,
  score: number,
  matchedThemes: string[],
  retrievalMode: "chroma" | "local",
  reason: string,
  similarity?: number
): RetrievedSource | null {
  if (!detail) return null;
  return {
    verse: detail,
    chapter: detail.chapter,
    translations: detail.translations.filter((item) => item.lang === "english").slice(0, 3),
    commentaries: detail.commentaries.filter((item) => item.lang === "english").slice(0, 2),
    score,
    similarity,
    retrievalMode,
    reason,
    matchedThemes: [...new Set(matchedThemes)]
  };
}

function detectThemes(question: string) {
  const normalized = question.toLowerCase();
  const themes = Object.entries(CONCERN_LEXICON)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([theme]) => theme);

  if (themes.includes("failure") && themes.includes("fear")) {
    return ["failure", "fear", ...themes.filter((theme) => theme !== "failure" && theme !== "fear")];
  }

  return themes.length ? themes : ["purpose"];
}

function buildExpandedTerms(question: string, themes: string[]) {
  return [
    ...tokenize(question),
    ...themes.flatMap((theme) => CONCERN_LEXICON[theme] ?? [])
  ].filter((term, index, all) => all.indexOf(term) === index);
}

function phraseOverlap(text: string, question: string) {
  const haystack = text.toLowerCase();
  const words = tokenize(question);
  let score = 0;
  for (let size = 2; size <= Math.min(4, words.length); size++) {
    for (let index = 0; index <= words.length - size; index++) {
      if (haystack.includes(words.slice(index, index + size).join(" "))) score += size;
    }
  }
  return score;
}

function containsCrisisLanguage(question: string) {
  const normalized = question.toLowerCase();
  return CRISIS_TERMS.some((term) => normalized.includes(term));
}

function composeGroundedAnswer(question: string, themes: string[], sources: RetrievedSource[]) {
  const references = sources.map((source) => verseRef(source.verse.chapter_number, source.verse.verse_number));
  const themeText = themes.length ? themes.join(", ") : "your question";
  const first = sources[0];
  const firstTranslation = first.translations[0];
  const firstCommentary = first.commentaries[0];

  const sections = {
    understanding: `I understand this as a question about ${themeText}. I will stay within the retrieved Bhagavad Gita sources rather than giving free-form spiritual advice.`,
    gitaSuggestion: `${firstTranslation ? truncate(firstTranslation.description, 340) : `The closest verse is Bhagavad Gita ${verseRef(first.verse.chapter_number, first.verse.verse_number)}.`}`,
    plainExplanation: firstCommentary
      ? `The commentary by ${firstCommentary.authorName} helps frame the verse this way: ${truncate(firstCommentary.description, 360)}`
      : `The available translation points to the central idea in Bhagavad Gita ${verseRef(first.verse.chapter_number, first.verse.verse_number)} without adding unsupported commentary.`,
    practicalReflection: `For reflection, notice what these sources ask you to examine: your action, your state of mind, and what you are attached to. A useful next step is to read the cited verses slowly and write one sentence about what is within your control today.`
  };

  return {
    sections,
    answer: [
      "Understanding the Concern",
      sections.understanding,
      "",
      "What the Gita Suggests",
      sections.gitaSuggestion,
      "",
      "Explanation in plain modern language",
      sections.plainExplanation,
      "",
      "Practical Reflection",
      sections.practicalReflection,
      "",
      `Sources Used: ${references.join(", ")}`
    ].join("\n")
  };
}

function emptySections(message: string) {
  return {
    understanding: message,
    gitaSuggestion: "No source-grounded suggestion is available.",
    plainExplanation: "YUDHSVAH will not invent a teaching when retrieval is insufficient.",
    practicalReflection: "Try asking with a more concrete concern or browse the reader experience directly."
  };
}

function logRetrieval(question: string, sources: RetrievedSource[]) {
  console.info(
    "[YUDHSVAH retrieval]",
    JSON.stringify({
      question,
      sources: sources.map((source) => ({
        ref: verseRef(source.verse.chapter_number, source.verse.verse_number),
        score: Number(source.score.toFixed(3)),
        similarity: source.similarity === undefined ? undefined : Number(source.similarity.toFixed(3)),
        mode: source.retrievalMode
      }))
    })
  );
}
