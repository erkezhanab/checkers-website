"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Search } from "lucide-react";
import { KAZAKH_CITIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface LeaderboardPlayer {
  id: string;
  username: string;
  city: string;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  rating: number;
  rank: number;
}

interface LeaderboardViewProps {
  players: LeaderboardPlayer[];
  unavailable?: boolean;
}

export function LeaderboardView({ players, unavailable }: LeaderboardViewProps) {
  const { t } = useLanguage();

  if (unavailable) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.leaderboard.unavailable}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.leaderboard.connectSupabase}</p>
      </div>
    );
  }
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = players.filter((p) => {
    const matchCity = cityFilter === "all" || p.city === cityFilter;
    const matchSearch = search === "" || p.username.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.leaderboard.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.leaderboard.playersRanked.replace("{n}", String(players.length))}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.leaderboard.searchPlayers}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{t.leaderboard.allCities}</option>
            {KAZAKH_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t.leaderboard.noPlayersFound}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((player, index) => (
              <PlayerRow key={player.id} player={player} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PlayerRow({ player, index }: { player: LeaderboardPlayer; index: number }) {
  const { t } = useLanguage();
  const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
  const winRate = player.games_played > 0 ? Math.round((player.wins / player.games_played) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-colors",
        index < 3
          ? "bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800 border-amber-200 dark:border-amber-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="w-8 text-center flex-shrink-0">
        {rankIcon ? (
          <span className="text-xl">{rankIcon}</span>
        ) : (
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{player.rank}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{player.username}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{player.city}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {player.games_played}G · {player.wins}W · {winRate}% WR
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-bold text-amber-600 dark:text-amber-400">{player.rating}</div>
        <div className="text-xs text-gray-400">{t.leaderboard.rating}</div>
      </div>
    </motion.div>
  );
}
