# PRD — WatchParty MVP

- **Product:** WatchParty (Async Watch Party)
- **Repo:** `dogfoodlab-io/watchparty`
- **Version:** MVP v1.1
- **Date:** 2026-02-10
- **Author:** Guilfoyle

---

## 1) Executive Summary

WatchParty lets people watch movies and TV episodes on their own schedules while still sharing a synchronized social experience.

Users create title-based parties, leave timestamped text/emoji reactions, and friends see those reactions as they reach the same moment.

MVP proves that async co-viewing drives engagement without real-time scheduling.

---

## 2) Problem

People want shared viewing but can’t consistently align schedules/time zones. Group chats are detached from exact moments in content and spoil context.

WatchParty fixes this by binding social interaction to timestamps in titles.

---

## 3) Goals and Non-Goals

### Goals (MVP)
1. Create and join watch parties centered on **titles** (not platforms).
2. Support both **movies and TV episodes**.
3. Capture and replay timestamped **text + emoji** reactions.
4. Support private groups and **public/anonymous preview** for non-private timelines.
5. Deliver timeline event display latency of **<= 5 seconds** from trigger moment.

### Non-Goals (MVP)
- Fully synchronized live co-watch playback.
- Native mobile apps.
- Advanced discovery marketplace/recommendation engine.
- Subscription/paywall monetization.

---

## 4) Product Principles

1. **Title-first model:** content identity is title/episode, not source platform.
2. **Async-first social:** no schedule required.
3. **Spoiler safety defaults:** progressive reveal where appropriate.
4. **Low-friction reactions:** quick text and emoji in-context.
5. **Privacy by design:** private by default, optional public previews.

---

## 5) Personas

1. **Long-distance friends** — want shared reactions without coordinating time.
2. **Couples/families in different time zones** — want emotional continuity around shared shows.
3. **Fandom groups** — want episode-level reaction timelines.

---

## 6) User Stories (MVP)

1. As a user, I can sign up/sign in.
2. As a user, I can create a party for a title (movie or episode).
3. As a user, I can invite others via link.
4. As a member, I can post text/emoji reactions at timestamps.
5. As a viewer, I can replay timeline events in sync with playback.
6. As a viewer, I can preview public timelines anonymously.
7. As an owner, I can mark timeline visibility private/public.
8. As a user, I can hide spoilers until I reach that moment.

---

## 7) Scope

### In Scope (MVP)
- Web app + browser extension (Chrome first)
- Auth and user profiles
- Party CRUD (title-based)
- Movie + episode support
- Member invites and join links
- Timeline event CRUD (text + emoji)
- Public timeline preview for non-private parties
- Overlay/timeline playback integration
- Basic notifications

### Out of Scope (MVP)
- Live playback synchronization
- Native iOS/Android apps
- Advanced moderation automation
- Rich media reactions (voice/video)

---

## 8) Functional Requirements

### 8.1 Auth & Accounts
- FR-1: Email/OAuth signup and login.
- FR-2: Persistent sessions across web + extension.
- FR-3: Profile with display name/avatar.

### 8.2 Title & Party Model
- FR-4: Create party tied to a title object.
- FR-5: Title supports `type = movie | episode`.
- FR-6: Episode fields include show title, season, episode number.

### 8.3 Membership & Access
- FR-7: Invite links for private parties.
- FR-8: Party visibility modes: `private`, `public_preview`.
- FR-9: `public_preview` allows anonymous read-only timeline access.

### 8.4 Timeline Reactions
- FR-10: Add event with `timestamp_sec`, `text`, optional emoji set.
- FR-11: Edit/delete own events.
- FR-12: Render markers and contextual overlays.
- FR-13: Spoiler controls (progressive reveal default for members).

### 8.5 Playback Experience
- FR-14: Extension reads current playback time.
- FR-15: Timeline events appear no later than **5 seconds** from matching timestamp.
- FR-16: Event posting from overlay without leaving player context.

### 8.6 Notifications (MVP basic)
- FR-17: Notify members of new party activity (in-app, optional digest email).

### 8.7 Moderation/Admin
- FR-18: Owner can remove members.
- FR-19: User can leave party.
- FR-20: Basic report/block controls.

---

## 9) Non-Functional Requirements

- NFR-1: Timeline query p95 < 400ms for typical party loads.
- NFR-2: Overlay reaction render within <= 5 seconds of timestamp.
- NFR-3: 99.5% availability target.
- NFR-4: Membership-based authorization + RLS.
- NFR-5: Basic audit logs for mutations.

---

## 10) Information Architecture & Data Model

### Core Entities
- `users`
- `titles` (movie or episode metadata)
- `parties`
- `party_members`
- `invites`
- `timeline_events`
- `watch_progress`
- `notifications`

### Suggested schema highlights

- `titles(id, type, name, release_year, show_name, season_number, episode_number, external_ref, created_at)`
- `parties(id, owner_id, title_id, visibility, created_at)`
- `timeline_events(id, party_id, user_id, timestamp_sec, text, emojis[], created_at, updated_at, deleted_at)`

---

## 11) API Surface (MVP)

- `POST /parties`
- `GET /parties`
- `GET /parties/:id`
- `PATCH /parties/:id` (visibility, metadata)
- `POST /parties/:id/invites`
- `POST /invites/:token/join`
- `GET /parties/:id/events?from=&to=`
- `POST /parties/:id/events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `PUT /parties/:id/progress`
- `GET /parties/:id/public-preview` (anonymous allowed when visibility permits)

---

## 12) Security & Privacy

- Private parties default.
- Public preview is explicitly opt-in.
- Anonymous users can only read approved public-preview data.
- Strict access checks for member-only actions.
- Rate limiting on reaction writes.
- Abuse handling: report/block + owner controls.

---

## 13) Success Metrics

### North Star
- **Async Engagement Rate:** % of parties with >=2 distinct users posting reactions.

### KPIs
- Party creation/week
- Invite acceptance rate
- Events per active party
- D7 retention (creators + members)
- Anonymous preview -> signup conversion
- % events displayed within 5-second SLA

### MVP success criteria
- >= 30% invite acceptance
- >= 40% parties with >=10 events in first 7 days
- >= 20% D7 creator retention
- >= 95% events displayed within 5-second window

---

## 14) Delivery Plan

### Phase 0 (Week 1): Foundation
- Auth, database schema, access model (RLS), analytics events.

### Phase 1 (Weeks 2-3): Core Product
- Title + party creation, invites, timeline CRUD, spoiler guardrails.

### Phase 2 (Weeks 4-5): Extension Integration
- Playback timestamp adapters, overlay display, in-player reaction posting.

### Phase 3 (Week 6): Hardening/Beta
- Public preview mode, performance tuning, QA, onboarding polish.

---

## 15) Risks & Mitigations

1. **Player DOM instability across providers**
   - Mitigate with adapter layer + launch with limited provider set.
2. **Spoiler backlash**
   - Progressive reveal default + explicit reveal toggle.
3. **Privacy leakage from public previews**
   - Strict field whitelisting + owner controls.
4. **Latency misses for timeline rendering**
   - Local prefetch and client-side buffering near current timestamp.

---

## 16) Decisions (Resolved Open Questions)

1. Platform strategy: **Title-driven experience, not streaming-platform-driven**.
2. Content support: **Movies + TV episodes** in MVP.
3. Visibility: **Public and anonymous preview** for non-private timelines.
4. Reaction types: **Text and emoji** supported.
5. Timing requirement: **5-second display window**.
