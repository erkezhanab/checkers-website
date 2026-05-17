-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Player stats table
create table if not exists player_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  username text not null,
  city text not null default 'Astana',
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  games_played integer not null default 0,
  rating integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Game records table
create table if not exists game_records (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references auth.users(id) on delete cascade not null,
  opponent_type text not null check (opponent_type in ('ai', 'human')),
  opponent_difficulty text check (opponent_difficulty in ('easy', 'medium', 'hard')),
  winner text not null check (winner in ('player', 'opponent', 'draw')),
  moves_count integer not null default 0,
  duration_seconds integer not null default 0,
  player_color text not null check (player_color in ('red', 'black')),
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table player_stats enable row level security;
alter table game_records enable row level security;

-- Policies for player_stats
create policy "Public read player_stats"
  on player_stats for select using (true);

create policy "Users insert own stats"
  on player_stats for insert
  with check (auth.uid() = user_id);

create policy "Users update own stats"
  on player_stats for update
  using (auth.uid() = user_id);

-- Policies for game_records
create policy "Users read own games"
  on game_records for select
  using (auth.uid() = player_id);

create policy "Users insert own games"
  on game_records for insert
  with check (auth.uid() = player_id);

-- Leaderboard view (public)
create or replace view leaderboard as
  select
    ps.id,
    ps.username,
    ps.city,
    ps.wins,
    ps.losses,
    ps.draws,
    ps.games_played,
    ps.rating,
    rank() over (order by ps.rating desc, ps.wins desc) as rank
  from player_stats ps
  where ps.games_played > 0
  order by ps.rating desc, ps.wins desc;

-- RPC: update_player_stats atomically
create or replace function update_player_stats(
  p_user_id uuid,
  p_winner text,
  p_rating_delta integer
) returns void as $$
begin
  update player_stats
  set
    games_played = games_played + 1,
    wins         = wins   + case when p_winner = 'player'   then 1 else 0 end,
    losses       = losses + case when p_winner = 'opponent' then 1 else 0 end,
    draws        = draws  + case when p_winner = 'draw'     then 1 else 0 end,
    rating       = greatest(0, rating + p_rating_delta)
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger player_stats_updated_at
  before update on player_stats
  for each row execute function update_updated_at();
