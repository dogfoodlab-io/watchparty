# WatchParty MVP Execution Backlog

This is the implementation kickoff plan derived from `docs/PRD-MVP-watchparty.md`.

## Epic 1 — Foundation (Auth + Data + Access)

1. Initialize backend project (Supabase-first)
2. Create schema migrations:
   - users/profile extension
   - titles (movie/episode)
   - parties
   - party_members
   - invites
   - timeline_events
   - watch_progress
   - notifications
3. Add RLS policies for all member-scoped resources
4. Add anonymous-safe policy path for `public_preview`
5. Add seed fixtures for local development

## Epic 2 — Party + Timeline Core

6. Build party list/create/detail pages
7. Build title picker input (movie/episode)
8. Build invite generation + accept flow
9. Build timeline list + markers UI
10. Build create/edit/delete reaction actions (text + emoji)
11. Add spoiler-safe progressive reveal mode

## Epic 3 — Extension Integration (Chrome)

12. Create extension scaffold (manifest v3)
13. Implement playback timestamp adapters (provider abstraction)
14. Inject overlay UI for timeline and composer
15. Hook extension auth/session to web app account
16. Implement event fetch + prebuffer for <=5s display SLA

## Epic 4 — Public Preview + Beta Hardening

17. Public preview route with anonymous read-only timeline
18. Privacy controls in party settings (private/public_preview)
19. Notification pipeline (in-app + optional digest)
20. Analytics instrumentation and dashboard
21. QA checklist + bug bash + launch readiness

---

## First 5 engineering tasks to execute now

1. Add DB migration scaffold and core tables.
2. Add RLS baseline policies (private + public preview paths).
3. Build `/app` shell with authenticated route guard.
4. Add minimal party CRUD UI backed by API stubs.
5. Add timeline event composer component (text + emoji) with local state.
