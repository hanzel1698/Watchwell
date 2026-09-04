-- =====================================================================
-- WatchWell — migration 0003
-- Removing a channel now removes its cached uploads.
--
-- 0001 declared watchwell_videos.channel_id as ON DELETE SET NULL, so
-- deleting a channel left its cached uploads behind with channel_id NULL —
-- indistinguishable from a video the admin whitelisted by hand. Those
-- orphans stayed in the kid's feed, showed up in "Manage Videos" labelled
-- "Added by a parent", and (once 0002 landed) inherited the hand-picked
-- exemption from the minimum-length rule.
--
-- CASCADE makes "channel_id IS NULL means the admin picked this video
-- individually" true by construction, whatever route the delete takes —
-- the app, the SQL editor, or a future admin tool.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Re-point the foreign key at ON DELETE CASCADE
-- The constraint is the one Postgres named for 0001's inline `references`.
-- ---------------------------------------------------------------------
alter table watchwell_videos
    drop constraint if exists watchwell_videos_channel_id_fkey;

alter table watchwell_videos
    add constraint watchwell_videos_channel_id_fkey
    foreign key (channel_id) references watchwell_channels (id)
    on delete cascade;

comment on table watchwell_videos is
    'channel_id is null only for videos whitelisted individually; a channel''s cached uploads are deleted with it.';

-- ---------------------------------------------------------------------
-- 2. Existing orphans are NOT cleaned up here
-- They can't be told apart from genuine hand-picked videos by any column,
-- so deleting them automatically could throw away videos the admin chose
-- deliberately. See README ("Cleaning up orphaned videos") for the query
-- that groups them by insert batch so they can be reviewed and removed.
-- ---------------------------------------------------------------------
