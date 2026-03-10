alter table public.parties
add column timeline_duration_sec integer not null default 7200;
