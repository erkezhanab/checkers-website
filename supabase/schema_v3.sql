-- ============================================================
-- Schema v3 — Run AFTER schema.sql and schema_v2.sql
-- ============================================================

-- Extend player_stats with pro and progress columns
alter table player_stats
  add column if not exists pro_status              boolean not null default false,
  add column if not exists selected_skin           text    not null default 'classic',
  add column if not exists learn_checkers_completed boolean not null default false,
  add column if not exists game_count              integer not null default 0;

-- ── RPCs (security definer → safe to call from client) ──────────────────────

-- Upgrade current user to Pro (no Stripe — direct upgrade)
create or replace function upgrade_to_pro() returns void as $$
begin
  update player_stats set pro_status = true where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Save the user's selected skin
create or replace function save_selected_skin(p_skin text) returns void as $$
begin
  update player_stats set selected_skin = p_skin where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Mark the interactive tutorial as completed
create or replace function mark_learn_completed() returns void as $$
begin
  update player_stats set learn_checkers_completed = true where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Increment game_count (only for Pro users, capped at 20)
create or replace function increment_game_count() returns void as $$
begin
  update player_stats
  set game_count = least(game_count + 1, 20)
  where user_id = auth.uid() and pro_status = true;
end;
$$ language plpgsql security definer;

-- ── Notes for Supabase Dashboard ────────────────────────────────────────────
-- To reduce "Too many attempts" auth errors, go to:
--   Supabase Dashboard → Auth → Rate Limits
-- and increase:
--   "Max emails sent per hour" (default: 4)
--   "Max password signins per hour" (default: 60)
-- For dev/testing, set these to 100+.
