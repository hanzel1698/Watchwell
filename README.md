# WatchWell

A YouTube-look-alike video viewer that only ever shows content an admin has
explicitly whitelisted (by channel or by individual video). Built for
personal, single-family use: one admin (PIN-gated dashboard), one kid
profile (no login).

Playback always streams live from YouTube via the official
[IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) —
nothing is downloaded or re-hosted. Metadata (titles, thumbnails, latest
uploads) comes from the [YouTube Data API v3](https://developers.google.com/youtube/v3),
and all app data (whitelist, watch history, settings) lives in Supabase.

## Status

Routing, the kid-facing feed/search/watch/history pages, and the admin
dashboard (whitelist management, watch history, daily time limit) are wired
up against a real Supabase backend — see `supabase/migrations/0001_watchwell_schema.sql`
for the schema and `src/services/*.js` for the data-access layer.

Visual design follows the approved mockup: warm cream background, red brand
accent, Baloo 2 (headings) + Inter (body) fonts, a PIN-keypad admin gate, and
a dark sidebar admin dashboard. See `src/index.css` (`@theme` block) for the
full design token list.

**Known schema limitation:** `watchwell_videos` only has a channel name via
its (nullable) FK to `watchwell_channels`. A video the admin whitelists
individually (not via a whole channel) has `channel_id = null`, so it has no
persisted channel name — the UI falls back to "Added by a parent" for those
cards rather than making an extra YouTube API call per video.

**Known platform limitation:** the embedded player's control bar always
shows a small YouTube logo that links out to youtube.com, and the video
title overlay is likewise a link back to YouTube — both are required by
YouTube's own embed terms and can't be removed via the IFrame Player API
(the player also runs in a cross-origin iframe, so there's no way to
intercept or hide that click from the parent page even with a workaround).
`WatchPage` sets `disablekb` and `iv_load_policy` to close off keyboard
shortcuts and clickable annotations as easier, more common exit routes, but
the logo link itself is an inherent tradeoff of using YouTube's official,
ToS-compliant embed rather than an unofficial player.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run the Supabase migration

In your Supabase project's SQL editor, run
`supabase/migrations/0001_watchwell_schema.sql`. It creates four
`watchwell_`-prefixed tables (channels, videos, watch history, settings)
without touching anything else in your project, and enables RLS with a
permissive "allow all" policy — reasonable for a single-user personal app
using the anon key, called out explicitly here in case you add real
multi-user auth later and want to tighten it.

### 3. Add your API keys

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `VITE_YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable "YouTube Data API v3", create an API key. Consider restricting it (HTTP referrer or IP) since it ships in the client bundle. |
| `VITE_SUPABASE_URL` | Your Supabase project settings → API → Project URL. |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project settings → API → anon/public key. Safe to ship client-side — it's only as powerful as the RLS policies above allow. |
| `VITE_ADMIN_PIN` | A 4-digit PIN, e.g. `2468` — the on-screen keypad is built for exactly 4 digits. |
| `VITE_KID_NAME` | Optional — kid's first name, shown in the home feed greeting and avatar. |

`.env.local` is gitignored and never committed.

**Known limitation:** because this is a static site with no server, anything
in a `VITE_*` variable — including `VITE_ADMIN_PIN` — ends up in the built
JS bundle and is technically viewable by anyone who opens dev tools. For a
single-family, low-stakes use case this is an acceptable trade-off, but it's
not a real secret. A future iteration could move PIN verification to a
Supabase Edge Function.

### 4. Run locally

```bash
npm run dev
```

## Deploying to Netlify

The repo includes a `netlify.toml` (build command `npm run build`, publish
directory `dist`).

1. In Netlify, "Add a new site" → "Import an existing project" → point it at
   this repo.
2. Netlify will read `netlify.toml` automatically — no build settings to
   configure by hand.
3. Under **Site configuration → Environment variables**, add the same
   variables as `.env.local`: `VITE_YOUTUBE_API_KEY`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PIN`, and optionally `VITE_KID_NAME`.
4. Deploy. The app uses `HashRouter` (routes live after `#`), so client-side
   routing works on Netlify with no extra rewrite rules needed.

To build manually:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Project structure

```
src/
  routes/kid/         Home feed, watch page, search, history, "time's up" screen
  routes/admin/        PIN login, dashboard/channels/videos/history/settings
  components/kid/      Video card/grid, side/bottom nav, shell, time-limit gate
  components/admin/    Whitelist forms, dashboard shell (sidebar/top menu)
  components/shared/   Header, Logo, Avatar (shared brand components)
  services/            Data access — whitelist, watch history, time limits,
                        feed cache, YouTube API (Supabase-backed)
  context/             Admin auth (PIN) context
  lib/                 Config/env, format helpers, YouTube IFrame API loader,
                        Supabase client, avatar pastel-color helper
supabase/migrations/    SQL schema (run once in the Supabase SQL editor)
```
