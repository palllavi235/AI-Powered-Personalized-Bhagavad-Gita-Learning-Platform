create extension if not exists "uuid-ossp";

create table if not exists authors (
  id integer primary key,
  name text not null
);

create table if not exists languages (
  id integer primary key,
  language text not null unique
);

create table if not exists chapters (
  id integer primary key,
  chapter_number integer not null unique,
  name text,
  name_meaning text,
  name_translation text not null,
  name_transliterated text,
  chapter_summary text not null,
  chapter_summary_hindi text,
  image_name text,
  verses_count integer not null
);

create table if not exists verses (
  id integer primary key,
  chapter_id integer references chapters(id),
  chapter_number integer not null,
  verse_number integer not null,
  verse_order integer not null,
  external_id integer,
  title text,
  sanskrit_text text not null,
  transliteration text,
  word_meanings text,
  unique (chapter_number, verse_number)
);

create table if not exists translations (
  id integer primary key,
  verse_id integer not null references verses(id) on delete cascade,
  author_id integer references authors(id),
  language_id integer references languages(id),
  lang text not null,
  author_name text not null,
  description text not null
);

create index if not exists translations_verse_idx on translations(verse_id);
create index if not exists translations_lang_idx on translations(lang);

create table if not exists commentaries (
  id integer primary key,
  verse_id integer not null references verses(id) on delete cascade,
  author_id integer references authors(id),
  language_id integer references languages(id),
  lang text not null,
  author_name text not null,
  description text not null
);

create index if not exists commentaries_verse_idx on commentaries(verse_id);
create index if not exists commentaries_lang_idx on commentaries(lang);

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

create table if not exists bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  verse_id integer not null references verses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, verse_id)
);

create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  verse_id integer not null references verses(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists notes_user_verse_idx on notes(user_id, verse_id);

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
