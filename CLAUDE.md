# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WatchParty** (branded as "Async Party") is an async social platform for movie/TV lovers to share reactions and comments on titles they're watching on their own time. The MVP focuses on:
- Title discovery via TMDB API
- Creating "parties" (timelines) for specific titles
- Party creation, sharing (via invites), and real-time comment viewing
- User authentication and profile management

**Tech Stack:**
- Frontend: React 19 + TypeScript + Tailwind CSS + Vite
- Backend: Supabase (PostgreSQL + Auth)
- Icons: lucide-react
- Package Manager: Yarn

## Development Commands

```bash
# Install dependencies (Yarn)
yarn install

# Start dev server (runs on http://localhost:3000)
yarn dev

# Build for production
yarn build

# Preview production build locally
yarn preview
```

## Architecture & Code Structure

### Client-Side Routing
- **File:** `App.tsx:34-52` - Manual history API-based routing (no React Router)
- Routes: `/`, `/sign-in`, `/sign-up`, `/forgot-password`, `/dashboard`, `/parties/{id}`, `/join/{token}`
- Auth routes redirect to `/dashboard` after login; app routes redirect to `/sign-in` if unauthenticated
- Navigation via `window.history.pushState()` with custom `navigate()` function

### Authentication & Layout
- **Supabase Auth** is the source of truth for user sessions
- Auth forms: SignInForm, SignUpForm, ForgotPasswordForm (App.tsx:87-285)
- Authenticated users see marketing site or Dashboard/PartyDetail
- Unauthenticated users see landing page with sign-in/up flows

### Component Structure
All components are in `/components`:
- **TMDBSearch.tsx** - Integrates TMDB API, handles title search with autocomplete
- **Dashboard.tsx** - Main authenticated view: TMDB search + party list + create party flow
- **PartyDetail.tsx** - Single party view with timeline events and playback sync
- **PartyList.tsx** - Lists user's parties/invitations
- **InvitePage.tsx** - Handle join flows via invite token (`/join/{token}`)
- **TimelineDemo.tsx, Features.tsx** - Marketing page components

### Database & Supabase Integration
- **Client:** `/lib/supabaseClient.ts` creates Supabase client with env vars
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_URL`/`SUPABASE_ANON_KEY`)
- **Migrations** in `/supabase/migrations/` - applied in order:
  1. `20260210133000_mvp_foundation.sql` - Core schema (profiles, titles, parties, invites, timeline_events, etc.)
  2. `20260222170736_join_party_rpc.sql` - RPC for joining parties
  3. `20260222222718_fix_parties_rls.sql` - RLS policy fixes
  4. `20260222224249_add_fk_to_profiles.sql` - Foreign key additions
  5. `20260222225302_add_party_timeline_duration.sql` - Party duration field

#### Key Tables
- **profiles** - User profiles synced from auth.users via trigger
- **titles** - TMDB-sourced titles (movies/episodes); `external_ref` format: `tmdb:{id}`
- **parties** - "Timelines" per title per owner; `visibility` is `private` or `public_preview`
- **party_members** - Junction table linking users to parties with roles (owner/member)
- **invites** - Tokens for sharing party access
- **timeline_events** - Comments/reactions anchored to timestamps
- **party_progress** - Viewer's playback position tracking

#### RLS & Security
- Profiles: readable by all authenticated users; own profile writable
- Parties: owners can read/write; members can read; public_preview parties readable by anonymous
- Timeline events: readable by party members; insertable by party members; deletable by owners
- All data access goes through RLS checks

### API Integration Points
- **TMDB API** - `vite.config.ts` exposes `VITE_TMDB_API_KEY` and `VITE_TMDB_ACCESS_TOKEN`
- Dashboard.tsx makes direct TMDB calls to fetch runtime and metadata
- TMDBSearch.tsx handles search queries

### Environment Variables
Required for local development:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_TMDB_API_KEY` or `VITE_TMDB_ACCESS_TOKEN` - TMDB credentials (for title search/details)
- Optional: `GEMINI_API_KEY` (legacy, not currently used in MVP)

Set these in `.env.local` before running `yarn dev`.

## Feature Workflow

**Creating a Party:**
1. User searches TMDB in Dashboard (TMDBSearch component)
2. Selects a movie/show, triggers `handleSelectTmdb()` in Dashboard
3. Code finds/creates Title record with TMDB external_ref
4. Fetches runtime from TMDB detail endpoint
5. Creates Party record with visibility setting
6. Trigger `add_owner_as_member()` auto-adds owner to party_members
7. Navigation to `/parties/{partyId}`

**Joining a Party:**
1. User opens `/join/{inviteToken}` (InvitePage)
2. Validates invite and party access
3. If authenticated, adds user to party_members
4. Navigates to `/parties/{partyId}`

**Timeline/Comments:**
- PartyDetail displays timeline_events synced to playback position
- Playback position tracked in party_progress table
- Comments created via timeline_events with timestamp_sec

## Common Development Tasks

### Adding a New Page/Route
1. Create component in `/components`
2. Add route to `AppRoute` type in App.tsx
3. Update `getAppRouteFromPath()` and routing logic in App.tsx main component
4. Handle in MarketingApp render conditions

### Modifying Database Schema
1. Create new migration file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write idempotent SQL (use `if not exists`, `drop if exists`)
3. Test locally: `supabase db reset` (wipes and reapplies all migrations)

### Calling Supabase from Components
Pattern used throughout (see Dashboard.tsx):
```typescript
const { data, error } = await supabase.from('table_name').select(...);
```
Always check `error` first and handle gracefully.

### TMDB API Calls
Use pattern from Dashboard.tsx:
- Build URL with `https://api.themoviedb.org/3/{endpoint}`
- Support both API key and Bearer token auth
- Handle response and fallbacks

## UI & Styling

- **Tailwind CSS** utility classes throughout
- **Custom classes:** `glass` (glassmorphism), `text-gradient` (gradient text)
- **Color scheme:** Dark theme (zinc/indigo/purple), no white backgrounds
- **Icons:** lucide-react for all icons (Play, Users, MessageSquare, etc.)

## Notes for Future Work

- Direct Supabase calls from components; consider API layer if complexity grows
- Manual routing without React Router - works for MVP but may refactor for larger app
- RLS policies handle authorization; client only makes authenticated requests
- TMDB episode selection is mocked (always season 1, ep 1) for MVP - needs full implementation
- Subtitle integration (Feature 3 in spec) not yet implemented
- Real-time sync via Supabase Realtime not yet wired up
