import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

type Row = Record<string, unknown>;

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "DATA", "ROW_Data", filename), "utf8")) as T;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  const authors = readJson<Row[]>("authors.json");
  const languages = readJson<Row[]>("languages.json");
  const chapters = readJson<Row[]>("chapters.json");
  const verses = readJson<Row[]>("verse.json");
  const translations = readJson<Row[]>("translation.json");
  const commentaries = readJson<Row[]>("commentary.json");

  try {
    await client.query("begin");

    for (const row of authors) {
      await client.query(
        "insert into authors (id, name) values ($1, $2) on conflict (id) do update set name = excluded.name",
        [row.id, row.name]
      );
    }

    for (const row of languages) {
      await client.query(
        "insert into languages (id, language) values ($1, $2) on conflict (id) do update set language = excluded.language",
        [row.id, row.language]
      );
    }

    for (const row of chapters) {
      await client.query(
        `insert into chapters
          (id, chapter_number, name, name_meaning, name_translation, name_transliterated, chapter_summary, chapter_summary_hindi, image_name, verses_count)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set
          chapter_number = excluded.chapter_number,
          name = excluded.name,
          name_meaning = excluded.name_meaning,
          name_translation = excluded.name_translation,
          name_transliterated = excluded.name_transliterated,
          chapter_summary = excluded.chapter_summary,
          chapter_summary_hindi = excluded.chapter_summary_hindi,
          image_name = excluded.image_name,
          verses_count = excluded.verses_count`,
        [
          row.id,
          row.chapter_number,
          row.name,
          row.name_meaning,
          row.name_translation,
          row.name_transliterated,
          row.chapter_summary,
          row.chapter_summary_hindi,
          row.image_name,
          row.verses_count
        ]
      );
    }

    for (const row of verses) {
      await client.query(
        `insert into verses
          (id, chapter_id, chapter_number, verse_number, verse_order, external_id, title, sanskrit_text, transliteration, word_meanings)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set
          chapter_id = excluded.chapter_id,
          chapter_number = excluded.chapter_number,
          verse_number = excluded.verse_number,
          verse_order = excluded.verse_order,
          external_id = excluded.external_id,
          title = excluded.title,
          sanskrit_text = excluded.sanskrit_text,
          transliteration = excluded.transliteration,
          word_meanings = excluded.word_meanings`,
        [
          row.id,
          row.chapter_id,
          row.chapter_number,
          row.verse_number,
          row.verse_order,
          row.externalId,
          row.title,
          row.text,
          row.transliteration,
          row.word_meanings
        ]
      );
    }

    for (const row of translations) {
      await client.query(
        `insert into translations (id, verse_id, author_id, language_id, lang, author_name, description)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id) do update set description = excluded.description`,
        [row.id, row.verse_id, row.author_id, row.language_id, row.lang, row.authorName, row.description]
      );
    }

    for (const row of commentaries) {
      await client.query(
        `insert into commentaries (id, verse_id, author_id, language_id, lang, author_name, description)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id) do update set description = excluded.description`,
        [row.id, row.verse_id, row.author_id, row.language_id, row.lang, row.authorName, row.description]
      );
    }

    await client.query("commit");
    console.log(`Imported ${chapters.length} chapters, ${verses.length} verses, ${translations.length} translations, ${commentaries.length} commentaries.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
