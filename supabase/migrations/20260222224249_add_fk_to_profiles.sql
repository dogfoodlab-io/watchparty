alter table public.timeline_events
  add constraint timeline_events_user_id_profile_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
