# YUDHSVAH - Fight Within

YUDHSVAH is a calm, source-grounded Bhagavad Gita wisdom platform. It supports a rich reading flow and a seeker guidance flow that retrieves verses, translations, and commentaries from the provided dataset before composing an answer.

# website -link
https://ai-powered-personalized-bhagavad-gi.vercel.app/

## Folder Structure

```txt
DATA/ROW_Data/              Raw Bhagavad Gita dataset
database/schema.sql         PostgreSQL schema
scripts/import-dataset.ts   JSON to PostgreSQL importer
scripts/index_chroma.py     ChromaDB vector index builder
scripts/embedding_service.py Local Sentence Transformers embedding API
src/app/                    Next.js App Router pages and API routes
src/components/             UI, auth, chat, and study components
src/lib/                    Dataset access, auth, database, retrieval, types
docs/                       Architecture, deployment, and review notes
```

## Environment Variables

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=
CHROMA_HOST=http://localhost:8000
CHROMA_COLLECTION=yudhsvah_gita
EMBEDDINGS_API_URL=http://localhost:7001/embed
ALLOW_DEMO_AUTH=false
```

`DATABASE_URL`, `CHROMA_HOST`, and `EMBEDDINGS_API_URL` are optional for local browsing. Without vector services, the app reads directly from `DATA/ROW_Data` and uses dynamic local source-grounded retrieval.

Production must set:

```bash
ALLOW_DEMO_AUTH=false
NEXT_PUBLIC_SUPABASE_URL=<project URL only, no /rest/v1 path>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
DATABASE_URL=<Supabase pooled PostgreSQL connection string>
```

## Run Commands

Install dependencies:

```bash
npm.cmd install
```

Start the app:

```bash
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

## PostgreSQL Setup

Create a database named `yudhsvah`, then run:

```bash
npm.cmd run db:schema
npm.cmd run db:import
```

The frontend remains usable before this step, but persistent users, bookmarks, notes, and reading history require PostgreSQL.

## ChromaDB and Sentence Transformers

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Build the Chroma index:

```bash
npm.cmd run chroma:index
```

Run Chroma:

```bash
chroma run --path ./chroma --host localhost --port 8000
```

Run the local embedding service:

```bash
uvicorn scripts.embedding_service:app --host 127.0.0.1 --port 7001
```

The API will use Chroma when `CHROMA_HOST` and `EMBEDDINGS_API_URL` are configured. If unavailable, it falls back to local source-grounded retrieval.

## MVP Test

Visit `/guidance` and submit:

```txt
I am afraid of failure.
```

The response should retrieve relevant Bhagavad Gita sources, cite translations/commentaries, show source sections, and avoid unsupported spiritual claims.

## Additional Docs

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/FINAL_REVIEW.md`
