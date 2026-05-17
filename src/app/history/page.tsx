"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import type { T } from "@/context/LanguageContext";

interface GameRecord {
  id: string;
  created_at: string;
  opponent_type: string;
  opponent_difficulty: string | null;
  winner: string;
  moves_count: number;
}

function opponentLabel(type: string, difficulty: string | null, t: T) {
  if (type === "ai") {
    const diff = difficulty
      ? ` (${difficulty === "easy" ? t.setup.easy : difficulty === "medium" ? t.setup.medium : t.setup.hard})`
      : "";
    return `${t.history.vsAi}${diff}`;
  }
  return t.history.vsFriend;
}

export default function HistoryPage() {
  const { user, isPro } = useUser();
  const { t } = useLanguage();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isPro || !isSupabaseConfigured()) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from("game_records")
      .select("id, created_at, opponent_type, opponent_difficulty, winner, moves_count")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setGames(data ?? []); setLoading(false); }, () => setLoading(false));
  }, [user, isPro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.history.signInTitle}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.history.signInDesc}</p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.history.proTitle}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t.history.proDesc}</p>
        <Link
          href="/pro"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-semibold transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {t.history.upgradeBtn}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.history.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.history.gamesPlayed.replace("{n}", String(games.length))}
            </p>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t.history.noGames}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {games.map((game, i) => {
              const won = game.winner === "player";
              const lost = game.winner === "opponent";
              const date = new Date(game.created_at).toLocaleDateString();
              const opponent = opponentLabel(game.opponent_type, game.opponent_difficulty, t);

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                >
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${won ? "bg-green-500" : lost ? "bg-red-500" : "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{opponent}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{game.moves_count} {t.history.moves} · {date}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                    won ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : lost ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {won ? t.history.win : lost ? t.history.loss : t.history.draw}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
