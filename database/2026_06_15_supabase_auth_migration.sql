create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  verse_id integer not null references verses(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb,
  unique (user_id, verse_id)
);

create table if not exists guidance_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  question text not null,
  answer text not null,
  themes text[] default '{}',
  retrieved_sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guidance_history_user_created_idx on guidance_history(user_id, created_at desc);
create unique index if not exists notes_user_verse_idx on notes(user_id, verse_id);
