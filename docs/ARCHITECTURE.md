# YUDHSVAH Architecture

YUDHSVAH is a source-grounded wisdom platform, not a religious website and not a generic chatbot.

## Application Layers

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI, reader tools, onboarding, dashboard, and guidance chat.
- `src/lib`: Dataset access, authentication, PostgreSQL access, retrieval, user preferences, shared types.
- `database/schema.sql`: PostgreSQL schema for content, users, bookmarks, notes, progress, and saved guidance.
- `scripts`: Dataset import, Chroma indexing, and local Sentence Transformers embedding service.

## Data Flow

Reader flow:

1. Pages read from the canonical JSON dataset through `src/lib/data.ts`.
2. Verse pages expose Sanskrit text, transliteration, word meanings, translations, and commentaries.
3. Bookmarks, notes, and progress persist to PostgreSQL when configured, with local storage support in the browser.

Guidance flow:

1. User submits a life question.
2. `src/lib/retrieval.ts` detects concern themes for explanation and query expansion.
3. Retrieval first attempts Chroma vector search when `CHROMA_HOST` and `EMBEDDINGS_API_URL` are available.
4. If vector services are unavailable, a dynamic local similarity fallback ranks the dataset across translations, commentaries, verse text, and chapter summaries.
5. The response is composed only from retrieved sources.
6. Sources, scores, similarity, and retrieval mode are logged server-side.

## Trust Rules

- No fabricated verses.
- No fabricated commentaries.
- No guru persona.
- No answer without sources.
- Crisis language receives a safety note.
- Raw source material is shown in expandable sections instead of being hidden.

## Deployment Shape

Recommended production setup:

- Vercel for Next.js.
- Supabase PostgreSQL for users and personalization.
- External Chroma service or hosted vector database compatible with the Chroma API.
- Separate Python service for Sentence Transformers embeddings.
