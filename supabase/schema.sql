-- Software Engineering Class A Portfolio Gallery
-- Unified User Profiles, Published Portfolios & Media Storage Schema
-- Safe to run on a fresh database OR re-run to upgrade an existing setup.

create extension if not exists pgcrypto;

-- 1. Unified profile + publishable portfolio table keyed by normalized lowercase email
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  auth_user_id uuid references auth.users(id) on delete set null,
  username text,
  display_name text not null default '',
  avatar_url text,
  bio text not null default '',
  roll_number text,
  role_title text not null default 'Software Engineering Student',
  discipline text not null default 'Full-Stack',
  project_title text not null default '',
  project_summary text not null default '',
  cover_image_url text,
  portfolio_url text,
  skills text[] not null default '{}',
  highlights text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  auth_providers text[] not null default '{}',
  last_sign_in_provider text,
  last_sign_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_email_lowercase check (email = lower(trim(email)))
);

-- Upgrade columns cleanly if user_profiles already existed from initial setup
alter table public.user_profiles add column if not exists username text;
alter table public.user_profiles add column if not exists bio text not null default '';
alter table public.user_profiles add column if not exists role_title text not null default 'Software Engineering Student';
alter table public.user_profiles add column if not exists discipline text not null default 'Full-Stack';
alter table public.user_profiles add column if not exists project_title text not null default '';
alter table public.user_profiles add column if not exists project_summary text not null default '';
alter table public.user_profiles add column if not exists cover_image_url text;
alter table public.user_profiles add column if not exists skills text[] not null default '{}';
alter table public.user_profiles add column if not exists highlights text[] not null default '{}';
alter table public.user_profiles add column if not exists social_links jsonb not null default '{}'::jsonb;
alter table public.user_profiles add column if not exists is_published boolean not null default false;
alter table public.user_profiles add column if not exists published_at timestamptz;

create index if not exists user_profiles_auth_user_id_idx
  on public.user_profiles (auth_user_id);

create unique index if not exists user_profiles_username_unique_idx
  on public.user_profiles (lower(username))
  where username is not null and length(trim(username)) > 0;

create index if not exists user_profiles_published_idx
  on public.user_profiles (is_published, published_at desc);

-- 2. Enable Row Level Security & set least-privilege table grants
alter table public.user_profiles enable row level security;
grant usage on schema public to anon, authenticated;
revoke all on table public.user_profiles from anon, authenticated;
grant select on table public.user_profiles to anon;
grant select, insert, update on table public.user_profiles to authenticated;

-- 3. RLS Policies
-- Owner can view their own profile (published or draft)
drop policy if exists "Users can view own profile by uid or email" on public.user_profiles;
create policy "Users can view own profile by uid or email"
  on public.user_profiles
  for select
  to authenticated
  using (
    auth_user_id = (select auth.uid())
    or email = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
  );

-- Visitors & classmates can view published portfolios in the gallery
drop policy if exists "Anyone can view published portfolios" on public.user_profiles;
create policy "Anyone can view published portfolios"
  on public.user_profiles
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (
    auth_user_id = (select auth.uid())
    and email = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
  );

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (
    auth_user_id = (select auth.uid())
    or email = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
  )
  with check (
    email = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
  );

-- 4. Private schema trigger for auth.users -> public.user_profiles sync
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_auth_user_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  derived_name text;
  derived_avatar text;
  derived_providers text[];
  latest_provider text;
begin
  normalized_email := lower(trim(coalesce(new.email, '')));
  if normalized_email = '' then
    return new;
  end if;

  derived_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(normalized_email, '@', 1)
  );

  derived_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
  );

  select coalesce(array_agg(distinct p), '{}')
  into derived_providers
  from jsonb_array_elements_text(
    coalesce(new.raw_app_meta_data -> 'providers', '[]'::jsonb)
  ) as p;

  latest_provider := nullif(trim(new.raw_app_meta_data ->> 'provider'), '');
  if latest_provider is not null and not (latest_provider = any(derived_providers)) then
    derived_providers := array_append(derived_providers, latest_provider);
  end if;

  insert into public.user_profiles (
    email,
    auth_user_id,
    display_name,
    avatar_url,
    auth_providers,
    last_sign_in_provider,
    last_sign_in_at
  )
  values (
    normalized_email,
    new.id,
    derived_name,
    derived_avatar,
    derived_providers,
    latest_provider,
    coalesce(new.last_sign_in_at, now())
  )
  on conflict (email) do update
  set
    auth_user_id = excluded.auth_user_id,
    display_name = coalesce(nullif(public.user_profiles.display_name, ''), excluded.display_name),
    avatar_url = coalesce(public.user_profiles.avatar_url, excluded.avatar_url),
    auth_providers = (
      select coalesce(array_agg(distinct p), '{}')
      from unnest(
        coalesce(public.user_profiles.auth_providers, '{}')
        || coalesce(excluded.auth_providers, '{}')
      ) as p
    ),
    last_sign_in_provider = coalesce(excluded.last_sign_in_provider, public.user_profiles.last_sign_in_provider),
    last_sign_in_at = coalesce(excluded.last_sign_in_at, now()),
    updated_at = now();

  return new;
end;
$$;

revoke all on function private.handle_auth_user_profile_sync() from public, anon, authenticated;

drop trigger if exists on_auth_user_upsert_profile on auth.users;
create trigger on_auth_user_upsert_profile
  after insert or update on auth.users
  for each row
  execute function private.handle_auth_user_profile_sync();

-- 5. Storage bucket for profile avatars & portfolio cover images
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read access for portfolio media" on storage.objects;
create policy "Public read access for portfolio media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Authenticated users can upload own portfolio media" on storage.objects;
create policy "Authenticated users can upload own portfolio media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Authenticated users can update own portfolio media" on storage.objects;
create policy "Authenticated users can update own portfolio media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Authenticated users can delete own portfolio media" on storage.objects;
create policy "Authenticated users can delete own portfolio media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
