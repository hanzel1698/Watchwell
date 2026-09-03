# WatchWell

A YouTube-look-alike video viewer that only ever shows content an admin has
explicitly whitelisted (by channel or by individual video). Built for
personal, single-family use: one admin (PIN-gated dashboard), one kid
profile (no login).

Playback always streams live from YouTube via the official
[IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) —
nothing is downloaded or re-hosted. Metadata (titles, thumbnails, latest
uploads) comes from the [YouTube Data API v3](https://developers.google.com/youtube/v3).

## Status

Routing, the kid-facing feed/search/watch/history pages, and the admin
dashboard (whitelist management, watch history, daily time limit) are wired
up and working against **local data** (`localStorage`) instead of a real
database. Supabase integration is intentionally not wired in yet — it's
waiting on a schema migration script. See `src/services/*.js` — each file is
commented `TEMPORARY` where it'll be swapped to real Supabase calls without
changing its exported function signatures.

Visual design follows the approved mockup: warm cream background, red brand
accent, Baloo 2 (headings) + Inter (body) fonts, a PIN-keypad admin gate, and
a dark sidebar admin dashboard. See `src/index.css` (`@theme` block) for the
full design token list.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your API keys

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `VITE_YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable "YouTube Data API v3", create an API key. Consider restricting it (HTTP referrer or IP) since it ships in the client bundle. |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Your Supabase project settings → API. Not yet used by the app (see Status above). |
| `VITE_ADMIN_PIN` | A 4-digit PIN, e.g. `2468` — the on-screen keypad is built for exactly 4 digits. |
| `VITE_KID_NAME` | Optional — kid's first name, shown in the home feed greeting and avatar. |

`.env.local` is gitignored and never committed.

**Known limitation:** because this is a static site with no server, anything
in a `VITE_*` variable — including `VITE_ADMIN_PIN` — ends up in the built
JS bundle and is technically viewable by anyone who opens dev tools. For a
single-family, low-stakes use case this is an acceptable trade-off, but it's
not a real secret. A future iteration could move PIN verification to a
Supabase Edge Function once the schema is in place.

### 3. Run locally

```bash
npm run dev
```

## Deploying to GitHub Pages

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
deploys automatically on every push to `main`.

One-time setup:

1. In the repo settings → **Pages**, set the source to **GitHub Actions**.
2. In repo settings → **Secrets and variables → Actions**, add repository
   secrets matching your `.env.local`: `VITE_YOUTUBE_API_KEY`,
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PIN`.
3. Push to `main` — the workflow builds the app and publishes `dist/` to
   Pages.

The app is configured to be served from `/watchwell/` (see `base` in
`vite.config.js`) — update that if the repo is ever renamed.

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
                        feed cache (all localStorage for now), YouTube API
  context/             Admin auth (PIN) context
  lib/                 Config/env, format helpers, YouTube IFrame API loader,
                        avatar pastel-color helper
```
