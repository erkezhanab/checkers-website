# ♟ Checkers — Online Draughts Game

A modern, full-featured checkers (draughts) game built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## What it does

- **Play checkers** with full rule enforcement: diagonal movement only, mandatory captures, king promotion (дамка), and win/draw detection.
- **Two game modes**: Player vs AI (3 difficulty levels) and Player vs Player on the same screen.
- **Smart AI opponent** powered by minimax with alpha-beta pruning — the Hard difficulty searches up to 7 moves deep.
- **AI Coach**: After each game, the AI reviews your play and highlights up to 3 key moments where a better move was available (missed captures, missed king promotions).
- **Authentication**: Sign up with username + city, log in, and persist your history across sessions.
- **Stats dashboard**: See your wins, losses, win rate, rating, and recent game history.
- **Global leaderboard**: Ranked by rating, filterable by Kazakh city (Astana, Almaty, Shymkent, …).
- **Dark / Light theme**: Automatic system detection with manual toggle.
- **Fully responsive**: Plays well on mobile and desktop.

## Who it's for

- Casual players who want a quick checkers game without installing anything.
- Students and hobbyists learning about minimax AI.
- Players in Kazakhstan who want to compete on a city-filtered leaderboard.

## Why it's valuable

Most checkers sites are dated, ad-heavy, or don't work on mobile. This app combines a clean modern UI, a real AI opponent with adjustable difficulty, and a post-game coach that helps you improve — all in one lightweight Next.js app backed by Supabase.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database / Auth | Supabase (PostgreSQL + Row Level Security) |
| Deployment | Vercel |

## Running locally

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/checkers-website.git
cd checkers-website
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `supabase/schema.sql` to create all tables, views, policies, and functions.
3. Copy your project URL and anon key from **Settings → API**.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home + game screen
│   ├── stats/              # Player stats page
│   ├── leaderboard/        # Global leaderboard
│   ├── auth/login/         # Sign in
│   ├── auth/signup/        # Create account
│   └── api/games/          # REST endpoint to save game results
├── components/
│   ├── Board.tsx           # Interactive game board
│   ├── GameControls.tsx    # Turn indicator, piece counters
│   ├── GameSetup.tsx       # Mode / difficulty picker
│   ├── AiCoach.tsx         # Post-game analysis panel
│   ├── Navbar.tsx          # Navigation bar
│   └── ThemeToggle.tsx     # Dark/light switch
├── lib/
│   ├── checkers/
│   │   ├── engine.ts       # Full checkers rule engine
│   │   └── ai.ts           # Minimax + alpha-beta AI
│   ├── supabase/           # Browser and server Supabase clients
│   └── types.ts            # Shared TypeScript types
├── hooks/
│   └── useGame.ts          # Game state + AI turn management
└── context/
    └── ThemeContext.tsx     # Theme provider
supabase/
└── schema.sql              # Complete database schema
```

## Game rules implemented

- Pieces move diagonally forward only (kings move in any direction).
- Captures are mandatory — if you can capture, you must.
- Chain captures (multiple jumps in one turn) are required when available.
- A piece reaching the opponent's back row becomes a king (♛).
- The game ends when a player has no pieces or no legal moves.

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.

## License

MIT
