# Deployment Guide

## GitHub Preparation

Do not commit:

- `.env`
- `.env.local`
- `.next`
- `node_modules`
- `.npm-cache`
- `venv`
- `chroma`
- logs

The `.gitignore` is already configured for these.

## Vercel

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Set the framework to Next.js.
4. Add environment variables.
5. Deploy.

Required production variables:

```txt
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://...
ALLOW_DEMO_AUTH=false
```

`NEXT_PUBLIC_SUPABASE_URL` must be the project URL only. Do not include `/rest/v1`, `/auth`, or any path.

Optional server-only variable:

```txt
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is not required for email/password login and must never be exposed to the browser.

Optional vector variables:

```txt
CHROMA_HOST=https://your-chroma-host
CHROMA_COLLECTION=yudhsvah_gita
EMBEDDINGS_API_URL=https://your-embedding-service/embed
```

## Supabase

1. Create a Supabase project.
2. Copy the pooled PostgreSQL connection string.
3. Set it as `DATABASE_URL`.
4. Run `database/schema.sql`.
5. Run `npm.cmd run db:import` locally against the Supabase connection.

## Chroma

For local indexing:

```bash
pip install -r requirements.txt
npm.cmd run chroma:index
```

Run services:

```bash
chroma run --path ./chroma --host localhost --port 8000
uvicorn scripts.embedding_service:app --host 127.0.0.1 --port 7001
```

Production should use hosted services instead of relying on local files.
