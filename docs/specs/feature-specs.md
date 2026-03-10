# WatchParty Feature Specifications

This document outlines the detailed specifications for the core workflow features of WatchParty.

## Feature 1: Create a Timeline for a Movie/TV Show Episode/Title

**Description:** 
A user can select a specific movie or TV show episode and initialize a "Timeline" (also known as a Party) dedicated to that title.

**Requirements:**
- **Title Discovery:** The user must be able to search for and select a title. We will integrate with TMDB (The Movie Database) API to fetch title metadata (type, name, release year, show name, season, episode number, external ref).
- **Timeline Creation:** Once a title is selected, the user creates a Timeline. This creates a record in the `parties` table linking the `owner_id` to the `title_id`.
- **Visibility Settings:** During creation, the user sets the visibility mode (e.g., `private`, `public_preview`).
- **Initial State:** The timeline starts empty (length of the video is derived from metadata or first user playback, though TMDB provides runtime).
- **User Interface:** A search bar with autocomplete dropdown for titles. A "Create Party/Timeline" button which navigates the user to the Timeline view.

## Feature 2: Sync Timeline to the Movie and Post Comments

**Description:**
A user can watch the selected movie/episode, and the application will sync the timeline to their current playback position. The user can post comments (reactions) that are permanently anchored to the exact timestamp of the video.

**Requirements:**
- **Playback Tracking:** The application runs in its own browser tab. Instead of integrating directly with an active video player extension, the user hits "Play/Sync" in the app when they start the video locally. The app maintains a running internal `currentTime` timer which the user can manually pause, resume, or seek to synchronize with their external playback.
- **Reaction Composer:** A dedicated view in the web application allowing the user to type text or pick emojis. 
- **Timestamp Anchoring:** When the user hits "Send", the comment is captured with the exact `timestamp_sec` of the video at that moment. The comment is saved to the `timeline_events` table.
- **Latency SLA:** The event must display on the timeline overlay efficiently, conforming to the <5 seconds NFR.
- **Spoiler Guardrails:** The composer should have an option to mark a comment as an explicit "Spoiler".

## Feature 3: View Movie Subtitles Along the Timeline

**Description:**
Users can view the official or user-generated subtitles for the movie/episode directly within the WatchParty timeline.

**Requirements:**
- **Subtitle Source API:** We will use the **OpenSubtitles REST API** (`api.opensubtitles.com`) to retrieve subtitle files `.srt` or `.vtt` based on the TMDB ID or IMDB ID of the title.
- **Integration Workflow:**
  1. Upon Timeline creation, the backend queues a job to fetch subtitles for the selected `title_id` via OpenSubtitles API.
  2. Subtitles are parsed and stored as `timeline_events` with a special type (`type: 'subtitle'`) or served as a separate track synced to the frontend.
- **UI Display:** Subtitles will run synchronously on the timeline track, visually distinct from user comments. Users can toggle the "Subtitle Track" on or off in the timeline settings.

## Feature 4: View and Follow Someone Else's Timeline in Real Time

**Description:**
A user ("viewer") can join a timeline created by someone else ("owner") and watch the content while seeing the owner's (and other members') comments pop up exactly when the viewer reaches the corresponding playback timestamp.

**Requirements:**
- **Access & Joining:** The viewer joins via an invite link. If it's `public_preview`, they can join anonymously or as read-only. We add them to `party_members` if authenticated.
- **Playback Sync (Viewer Side):** The viewer starts their video externally and hits "Play/Sync" in the WatchParty tab to start their own synced timer. The viewer can manually adjust this internal timer if their video playback pauses or jumps.
- **Event Hydration:** As the internal timer progresses, the frontend fetches `timeline_events` for the current window (e.g., `currentTime` to `currentTime + 60s`) and caches them.
- **Replay Execution:** As the video's time elapses, comments originally posted by others appear exactly at their recorded `timestamp_sec`.
- **Progressive Reveal:** Comments ahead of the viewer's `currentTime` are hidden or obscured to prevent spoilers, enforcing the "progressive reveal default" spec. 

