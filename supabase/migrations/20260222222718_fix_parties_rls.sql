-- Fix infinite recursion in RLS by using security definer
create or replace function public.is_party_member(p_party_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
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
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.parties p
    where p.id = p_party_id
      and p.visibility = 'public_preview'
  );
$$;

-- Drop the old party select policy
drop policy if exists "parties_select_member_or_public" on public.parties;

-- Recreate it, adding the owner_id = auth.uid() check to prevent RLS failure during INSERT ... RETURNING
create policy "parties_select_member_or_public"
  on public.parties for select
  to anon, authenticated
  using (
    visibility = 'public_preview'
    or owner_id = auth.uid()
    or public.is_party_member(id, auth.uid())
  );

-- Also optimize party_members to let the user see their own rows without making a function call
drop policy if exists "party_members_select_member_or_public" on public.party_members;

create policy "party_members_select_member_or_public"
  on public.party_members for select
  to anon, authenticated
  using (
    user_id = auth.uid()
    or public.is_party_member(party_id, auth.uid())
    or public.can_preview_party(party_id)
  );
