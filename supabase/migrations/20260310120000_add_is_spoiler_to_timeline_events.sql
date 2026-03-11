-- Add spoiler flag to timeline_events
alter table public.timeline_events
  add column if not exists is_spoiler boolean not null default false;
