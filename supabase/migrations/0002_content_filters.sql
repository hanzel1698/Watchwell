-- =====================================================================
-- WatchWell — migration 0002
-- Content rules for the kid-facing catalog, on top of the whitelist:
--   * a minimum video length (short uploads stay in the DB but are hidden)
--   * no live / scheduled broadcasts
-- Safe to re-run; it only adds to what 0001 created.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Live-broadcast flag on cached videos
-- Rewritten on every feed refresh rather than latched, since a broadcast
-- that is live today is an ordinary archived video once it ends.
-- ---------------------------------------------------------------------
alter table watchwell_videos
    add column if not exists is_live boolean not null default false;

comment on column watchwell_videos.is_live is
    'True while the video is a live or scheduled broadcast; such videos are never shown to the kid.';

-- ---------------------------------------------------------------------
-- 2. Minimum video length (minutes), 0 disables the rule
-- Read by contentFilterService; the app falls back to 20 if this row is
-- missing, so seeding it is a convenience rather than a requirement.
-- ---------------------------------------------------------------------
insert into watchwell_settings (key, value)
values ('min_video_duration_minutes', '20')
on conflict (key) do nothing;
