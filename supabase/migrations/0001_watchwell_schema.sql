-- =====================================================================
-- WatchWell — Supabase migration
-- Parental-control YouTube viewer: whitelisted channels/videos,
-- watch history, and time-limit settings.
-- All tables prefixed watchwell_ to avoid colliding with existing tables.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Whitelisted channels
-- ---------------------------------------------------------------------
create table if not exists watchwell_channels (
    id                  uuid primary key default gen_random_uuid(),
    youtube_channel_id  text not null unique,
    channel_name        text not null,
    thumbnail_url       text,
    added_at            timestamptz not null default now()
);

comment on table watchwell_channels is 'Channels approved by admin; kid feed pulls latest uploads from these.';

-- ---------------------------------------------------------------------
-- 2. Whitelisted videos (individually approved, or cached from a channel)
-- ---------------------------------------------------------------------
create table if not exists watchwell_videos (
    id                 uuid primary key default gen_random_uuid(),
    youtube_video_id   text not null unique,
    title              text not null,
    thumbnail_url      text,
    duration_seconds   integer,
    channel_id         uuid references watchwell_channels(id) on delete set null,
    published_at       timestamptz,       -- YouTube's original upload date
    added_at           timestamptz not null default now()
);

comment on table watchwell_videos is 'channel_id is null for videos whitelisted individually rather than via a whole channel.';

create index if not exists idx_watchwell_videos_channel_id
    on watchwell_videos (channel_id);

-- ---------------------------------------------------------------------
-- 3. Watch history (auto-logged from kid's playback)
-- ---------------------------------------------------------------------
create table if not exists watchwell_watch_history (
    id                 uuid primary key default gen_random_uuid(),
    youtube_video_id   text not null,
    title              text not null,
    watched_at         timestamptz not null default now(),
    duration_seconds   integer not null default 0   -- how long the kid actually watched
);

create index if not exists idx_watchwell_watch_history_watched_at
    on watchwell_watch_history (watched_at);

-- ---------------------------------------------------------------------
-- 4. Settings (key/value — daily time limit, etc.)
-- ---------------------------------------------------------------------
create table if not exists watchwell_settings (
    key         text primary key,
    value       text not null,
    updated_at  timestamptz not null default now()
);

-- Seed a sensible default so the app has something to read on first run
insert into watchwell_settings (key, value)
values ('daily_time_limit_minutes', '60')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 5. Row Level Security
-- Single-admin, single-kid, single-device personal app — no multi-tenant
-- auth needed. Enable RLS and allow all access via the anon/service key
-- your app already uses, rather than leaving tables fully open.
-- Tighten later if you add real user auth.
-- ---------------------------------------------------------------------
alter table watchwell_channels       enable row level security;
alter table watchwell_videos         enable row level security;
alter table watchwell_watch_history  enable row level security;
alter table watchwell_settings       enable row level security;

create policy "watchwell_channels_allow_all"
    on watchwell_channels for all
    using (true) with check (true);

create policy "watchwell_videos_allow_all"
    on watchwell_videos for all
    using (true) with check (true);

create policy "watchwell_watch_history_allow_all"
    on watchwell_watch_history for all
    using (true) with check (true);

create policy "watchwell_settings_allow_all"
    on watchwell_settings for all
    using (true) with check (true);
