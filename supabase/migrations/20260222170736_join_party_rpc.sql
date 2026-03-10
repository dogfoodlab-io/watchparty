create or replace function public.join_party_by_token(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_party_id uuid;
  v_invite_id uuid;
  v_max_uses int;
  v_used_count int;
  v_expires_at timestamptz;
begin
  -- Find the invite
  select id, party_id, max_uses, used_count, expires_at
  into v_invite_id, v_party_id, v_max_uses, v_used_count, v_expires_at
  from public.invites
  where token = invite_token
  for update; -- Lock the row to prevent race conditions on usage count

  if not found then
    raise exception 'Invalid invite token';
  end if;

  -- Check expiration
  if v_expires_at is not null and v_expires_at < now() then
    raise exception 'Invite token has expired';
  end if;

  -- Check usage limits
  if v_max_uses is not null and v_used_count >= v_max_uses then
    raise exception 'Invite token has reached its maximum usage limit';
  end if;

  -- Increment use count
  update public.invites
  set used_count = used_count + 1
  where id = v_invite_id;

  -- Insert user into party members if not already a member
  insert into public.party_members (party_id, user_id, role)
  values (v_party_id, auth.uid(), 'member')
  on conflict (party_id, user_id) do nothing;

  return v_party_id;
end;
$$;
