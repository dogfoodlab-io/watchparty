-- WatchParty MVP Foundation Schema + RLS
-- Epic 1: auth/profile + title/party/timeline core with public preview support

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'title_type') then
    create type public.title_type as enum ('movie', 'episode');
  end if;

  if not exists (select 1 from pg_type where typname = 'party_visibility') then
    create type public.party_visibility as enum ('private', 'public_preview');
  end if;

  if not exists (select 1 from pg_type where typname = 'party_role') then
    create type public.party_role as enum ('owner', 'member');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_watchparty on auth.users;

create trigger on_auth_user_created_watchparty
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Titles + Parties
-- -----------------------------------------------------------------------------

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  type public.title_type not null,
  name text not null,
  release_year int,
  show_name text,
  season_number int,
  episode_number int,
  external_ref text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint episode_fields_required check (
    (type = 'movie')
    or (type = 'episode' and show_name is not null and season_number is not null and episode_number is not null)
  )
);

create index if not exists idx_titles_name on public.titles (name);
create index if not exists idx_titles_external_ref on public.titles (external_ref);

create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title_id uuid not null references public.titles(id) on delete restrict,
  name text,
  visibility public.party_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_parties_owner on public.parties (owner_id);
create index if not exists idx_parties_title on public.parties (title_id);
create index if not exists idx_parties_visibility on public.parties (visibility);

drop trigger if exists trg_parties_updated_at on public.parties;
create trigger trg_parties_updated_at
  before update on public.parties
  for each row execute function public.set_updated_at();

create table if not exists public.party_members (
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.party_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index if not exists idx_party_members_user on public.party_members (user_id);

-- ensure owner is always in party_members
create or replace function public.add_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.party_members (party_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (party_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

drop trigger if exists trg_add_owner_as_member on public.parties;
create trigger trg_add_owner_as_member
  after insert on public.parties
  for each row execute function public.add_owner_as_member();

-- -----------------------------------------------------------------------------
-- Invites + Timeline + Progress + Notifications
-- -----------------------------------------------------------------------------

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  token text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now(),
  constraint invite_max_uses_positive check (max_uses is null or max_uses > 0),
  constraint invite_usage_valid check (used_count >= 0)
);

create index if not exists idx_invites_party on public.invites (party_id);
create index if not exists idx_invites_token on public.invites (token);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp_sec int not null check (timestamp_sec >= 0),
  text text,
  emojis text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint timeline_event_payload_required check (
    coalesce(length(trim(text)), 0) > 0 or coalesce(array_length(emojis, 1), 0) > 0
  )
);

create index if not exists idx_timeline_events_party_time on public.timeline_events (party_id, timestamp_sec);
create index if not exists idx_timeline_events_party_created on public.timeline_events (party_id, created_at desc);

drop trigger if exists trg_timeline_events_updated_at on public.timeline_events;
create trigger trg_timeline_events_updated_at
  before update on public.timeline_events
  for each row execute function public.set_updated_at();

create table if not exists public.watch_progress (
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_timestamp_sec int not null default 0 check (last_timestamp_sec >= 0),
  updated_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index if not exists idx_watch_progress_user on public.watch_progress (user_id);

drop trigger if exists trg_watch_progress_updated_at on public.watch_progress;
create trigger trg_watch_progress_updated_at
  before update on public.watch_progress
  for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Access helper functions
-- -----------------------------------------------------------------------------

create or replace function public.is_party_member(p_party_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.party_members pm
    where pm.party_id = p_party_id
      and pm.user_id = p_user_id
  );
$$;

create or replace function public.can_preview_party(p_party_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.parties p
    where p.id = p_party_id
      and p.visibility = 'public_preview'
  );
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.titles enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.invites enable row level security;
alter table public.timeline_events enable row level security;
alter table public.watch_progress enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- titles
create policy "titles_select_authenticated"
  on public.titles for select
  to authenticated
  using (true);

create policy "titles_insert_authenticated"
  on public.titles for insert
  to authenticated
  with check (created_by = auth.uid());

-- parties
create policy "parties_select_member_or_public"
  on public.parties for select
  to anon, authenticated
  using (
    visibility = 'public_preview'
    or public.is_party_member(id, auth.uid())
  );

create policy "parties_insert_owner"
  on public.parties for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "parties_update_owner"
  on public.parties for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "parties_delete_owner"
  on public.parties for delete
  to authenticated
  using (owner_id = auth.uid());

-- party_members
create policy "party_members_select_member_or_public"
  on public.party_members for select
  to anon, authenticated
  using (
    public.is_party_member(party_id, auth.uid())
    or public.can_preview_party(party_id)
  );

create policy "party_members_insert_owner_only"
  on public.party_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.parties p
      where p.id = party_id
        and p.owner_id = auth.uid()
    )
  );

create policy "party_members_delete_owner_or_self"
  on public.party_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.parties p
      where p.id = party_id
        and p.owner_id = auth.uid()
    )
  );

-- invites
create policy "invites_select_party_members"
  on public.invites for select
  to authenticated
  using (public.is_party_member(party_id, auth.uid()));

create policy "invites_insert_party_members"
  on public.invites for insert
  to authenticated
  with check (
    public.is_party_member(party_id, auth.uid())
    and created_by = auth.uid()
  );

create policy "invites_update_owner_only"
  on public.invites for update
  to authenticated
  using (
    exists (
      select 1 from public.parties p
      where p.id = party_id
        and p.owner_id = auth.uid()
    )
  );

-- timeline_events
create policy "timeline_events_select_member_or_public"
  on public.timeline_events for select
  to anon, authenticated
  using (
    deleted_at is null
    and (
      public.is_party_member(party_id, auth.uid())
      or public.can_preview_party(party_id)
    )
  );

create policy "timeline_events_insert_member"
  on public.timeline_events for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_party_member(party_id, auth.uid())
  );

create policy "timeline_events_update_owner_self"
  on public.timeline_events for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_party_member(party_id, auth.uid())
  )
  with check (
    user_id = auth.uid()
    and public.is_party_member(party_id, auth.uid())
  );

create policy "timeline_events_delete_owner_self"
  on public.timeline_events for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.parties p
      where p.id = party_id
        and p.owner_id = auth.uid()
    )
  );

-- watch_progress
create policy "watch_progress_select_self"
  on public.watch_progress for select
  to authenticated
  using (user_id = auth.uid());

create policy "watch_progress_upsert_self"
  on public.watch_progress for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_party_member(party_id, auth.uid())
  );

create policy "watch_progress_update_self"
  on public.watch_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- notifications
create policy "notifications_select_self"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_self"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.parties, public.party_members, public.timeline_events to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
