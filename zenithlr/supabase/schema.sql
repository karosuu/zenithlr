-- Optional production schema. The app currently uses data/db.json so the
-- team can work locally. Run this in Supabase when you are ready to host.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text check (role in ('admin', 'agent')) default 'agent',
  phone text,
  whatsapp text,
  photo text
);

create table if not exists page_content (
  page_key text not null,
  section_key text not null,
  en text default '',
  es text default '',
  media_url text,
  primary key (page_key, section_key)
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  property_id text,
  status text not null default 'draft',
  goals text[] not null default '{}',
  featured boolean default false,
  agent_id text,
  title_en text, title_es text,
  location text,
  property_type text,
  price numeric not null,
  price_period text default 'sale',
  bedrooms numeric,
  bathrooms numeric,
  construction_area numeric,
  lot_area numeric,
  levels numeric,
  kitchen numeric,
  service_room numeric,
  maintenance_fee numeric,
  year_built numeric,
  parking numeric,
  description_en text, description_es text,
  features_en text, features_es text,
  amenities jsonb default '[]',
  faq jsonb default '[]',
  video_url text,
  map_url text
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  url text not null,
  is_cover boolean default false,
  sort_order int default 0
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  published boolean default false,
  date date,
  cover text,
  title_en text, title_es text,
  excerpt_en text, excerpt_es text,
  body_en text, body_es text
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  quote_en text default '',
  quote_es text default '',
  date date,
  featured boolean default false,
  published boolean default false,
  sort_order int default 0
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text,
  name text,
  email text,
  phone text,
  message text,
  listing_slug text,
  locale text
);
