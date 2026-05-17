-- ============================================================
-- Schema v2 — Run this AFTER schema.sql
-- ============================================================

-- Game rooms for online multiplayer
create table if not exists game_rooms (
  id          uuid    primary key default uuid_generate_v4(),
  code        text    unique not null,
  host_id     uuid    references auth.users(id) on delete cascade,
  guest_id    uuid    references auth.users(id) on delete cascade,
  host_username  text not null default '',
  guest_username text not null default '',
  status      text    not null default 'waiting'
              check (status in ('waiting', 'playing', 'finished')),
  board_state jsonb   not null default '{}'::jsonb,
  current_turn text   not null default 'black'
              check (current_turn in ('red', 'black')),
  host_color  text    not null default 'black'
              check (host_color in ('red', 'black')),
  winner      text    check (winner in ('host', 'guest', 'draw')),
  move_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table game_rooms enable row level security;

create policy "Public can read game_rooms"
  on game_rooms for select using (true);

create policy "Auth users can create rooms"
  on game_rooms for insert
  with check (auth.uid() = host_id);

create policy "Room players can update"
  on game_rooms for update
  using (auth.uid() = host_id or auth.uid() = guest_id);

create trigger game_rooms_updated_at
  before update on game_rooms
  for each row execute function update_updated_at();

-- Function to generate a 6-char room code (no ambiguous chars)
create or replace function generate_room_code() returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars))::integer + 1, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- RPC: create a room atomically (generates unique code)
create or replace function create_game_room(
  p_host_id      uuid,
  p_host_username text,
  p_host_color   text,
  p_board_state  jsonb
) returns text as $$
declare
  new_code text;
  attempts integer := 0;
begin
  loop
    new_code := generate_room_code();
    begin
      insert into game_rooms(code, host_id, host_username, host_color, board_state)
      values (new_code, p_host_id, p_host_username, p_host_color, p_board_state);
      return new_code;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 10 then
        raise exception 'Could not generate unique room code';
      end if;
    end;
  end loop;
end;
$$ language plpgsql security definer;

-- User pro subscription status (Stripe-ready)
create table if not exists user_subscriptions (
  id          uuid    primary key default uuid_generate_v4(),
  user_id     uuid    references auth.users(id) on delete cascade unique not null,
  plan        text    not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  valid_until timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table user_subscriptions enable row level security;

create policy "Users read own subscription"
  on user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on user_subscriptions for insert
  with check (auth.uid() = user_id);

-- Function to check if user is pro
create or replace function is_pro(p_user_id uuid) returns boolean as $$
  select exists (
    select 1 from user_subscriptions
    where user_id = p_user_id
      and plan = 'pro'
      and (valid_until is null or valid_until > now())
  );
$$ language sql security definer;

-- Enable realtime for game_rooms (run in Supabase dashboard if needed)
-- alter publication supabase_realtime add table game_rooms;
