# Supabase setup (WatchParty MVP)

## Prerequisites

- Supabase CLI
- Docker Desktop running

## Local start

```bash
supabase start
```

## Apply migrations locally

```bash
supabase db reset
```

## Generate a new migration

```bash
supabase migration new <name>
```

## Notes

- Core MVP schema + RLS is in:
  - `supabase/migrations/20260210133000_mvp_foundation.sql`
- Public preview is supported via `parties.visibility = 'public_preview'`.
- Timeline preview access for anonymous users is read-only.
