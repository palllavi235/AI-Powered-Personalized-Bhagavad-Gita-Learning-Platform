import json
import os
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "DATA" / "ROW_Data"
COLLECTION = os.getenv("CHROMA_COLLECTION", "yudhsvah_gita")
PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", str(ROOT / "chroma"))
MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


def load(name):
    with open(DATA / name, "r", encoding="utf-8") as handle:
        return json.load(handle)


def chunk(text, size=900):
    words = " ".join((text or "").split()).split(" ")
    for index in range(0, len(words), size):
        value = " ".join(words[index : index + size]).strip()
        if value:
            yield value


def main():
    verses = load("verse.json")
    translations = load("translation.json")
    commentaries = load("commentary.json")
    chapters = {row["chapter_number"]: row for row in load("chapters.json")}

    by_verse = {row["id"]: {"verse": row, "translations": [], "commentaries": []} for row in verses}
    for row in translations:
        if row.get("lang") == "english" and row["verse_id"] in by_verse:
            by_verse[row["verse_id"]]["translations"].append(row)
    for row in commentaries:
        if row.get("lang") == "english" and row["verse_id"] in by_verse:
            by_verse[row["verse_id"]]["commentaries"].append(row)

    model = SentenceTransformer(MODEL_NAME)
    client = chromadb.PersistentClient(path=PERSIST_DIR)
    collection = client.get_or_create_collection(name=COLLECTION, metadata={"hnsw:space": "cosine"})

    ids = []
    documents = []
    metadatas = []

    for verse_id, item in by_verse.items():
        verse = item["verse"]
        chapter = chapters.get(verse["chapter_number"], {})
        source_text = "\n".join(
            [
                verse.get("transliteration", ""),
                verse.get("word_meanings", ""),
                *[t.get("description", "") for t in item["translations"][:4]],
                *[c.get("description", "") for c in item["commentaries"][:2]],
            ]
        )
        for idx, text in enumerate(chunk(source_text)):
            ids.append(f"verse-{verse_id}-{idx}")
            documents.append(text)
            metadatas.append(
                {
                    "verse_id": verse_id,
                    "chapter_number": verse["chapter_number"],
                    "verse_number": verse["verse_number"],
                    "chapter_title": chapter.get("name_translation", ""),
                }
            )

    embeddings = model.encode(documents, batch_size=64, show_progress_bar=True).tolist()
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)
    print(f"Indexed {len(ids)} chunks into Chroma collection '{COLLECTION}' at {PERSIST_DIR}.")


if __name__ == "__main__":
    main()
