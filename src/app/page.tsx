"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameSetup } from "@/components/GameSetup";
import { Board } from "@/components/Board";
import { GameControls } from "@/components/GameControls";
import { AiCoach } from "@/components/AiCoach";
import { SpeedTimer } from "@/components/SpeedTimer";
import type { GameConfig } from "@/lib/types";
import { useGame } from "@/hooks/useGame";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CheckersLogo } from "@/components/CheckersLogo";
import { useUser } from "@/context/UserContext";

export default function Page() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [key, setKey] = useState(0);
  const { t } = useLanguage();
  const { profile, loading: profileLoading } = useUserProfile();
  const searchParams = useSearchParams();

  // skin from URL param (set by shop "Play with X" button) takes priority, then saved skin
  const skinFromUrl = searchParams.get("skin") ?? undefined;
  const selectedSkinId = skinFromUrl ?? profile?.selected_skin ?? "classic";

  const handleStart = (cfg: GameConfig) => {
    setConfig({ ...cfg, skinId: selectedSkinId });
    setKey((k) => k + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!config ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-center gap-4 mb-3"
              >
                <CheckersLogo size={56} />
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  Checkers
                </h1>
              </motion.div>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 dark:text-gray-400 mb-4"
              >
                {t.home.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  {t.home.tutorial}
                </Link>
              </motion.div>
            </div>
            <GameSetup
              onStart={handleStart}
              selectedSkinId={profileLoading ? undefined : selectedSkinId}
            />
          </motion.div>
        ) : (
          <GameView
            key={key}
            config={config}
            onNewGame={() => setConfig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameView({ config, onNewGame }: { config: GameConfig; onNewGame: () => void }) {
  const { state, coachInsights, isAiThinking, timeLeft, handleCellClick, resetGame } = useGame(config);
  const { t } = useLanguage();
  const { isPro } = useUser();

  const flipped = config.mode === "ai" && config.playerColor === "red";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-6 items-start justify-center"
    >
      <div className="flex flex-col items-center gap-6">
        <Board state={state} onCellClick={handleCellClick} flipped={flipped} skinId={config.skinId} />

        <AnimatePresence>
          {state.status !== "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">
                {state.status === "red_wins" ? "🔴" : state.status === "black_wins" ? "⚫" : "🤝"}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {state.status === "red_wins" ? t.home.redWins : state.status === "black_wins" ? t.home.blackWins : t.home.draw}
              </h2>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                >
                  {t.home.playAgain}
                </button>
                <button
                  onClick={onNewGame}
                  className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
                >
                  {t.home.newSetup}
                </button>
              </div>
              <Link
                href={isPro ? "/history" : "/pro"}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              >
                <Sparkles className="w-4 h-4" />
                {isPro ? t.home.viewAnalysis : t.home.upgradeForAi}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        {config.speedMode && (
          <SpeedTimer
            timeLeft={timeLeft}
            currentTurn={state.currentTurn}
            isPlaying={state.status === "playing"}
          />
        )}

        <GameControls state={state} config={config} onReset={resetGame} isAiThinking={isAiThinking} />

        {(coachInsights.length > 0 || state.status !== "playing") && (
          <AiCoach
            insights={coachInsights}
            gameState={state}
            playerColor={config.playerColor}
          />
        )}

        <MoveHistory moves={state.moveHistory} />
      </div>
    </motion.div>
  );
}

function MoveHistory({ moves }: { moves: { from: { row: number; col: number }; to: { row: number; col: number }; captures: unknown[] }[] }) {
  const { t } = useLanguage();
  if (moves.length === 0) return null;

  const toAlgebraic = (row: number, col: number) => `${"abcdefgh"[col]}${8 - row}`;

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">{t.home.moveHistory}</h3>
      <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
        {moves.map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="w-6 text-right text-gray-400 flex-shrink-0">{i + 1}.</span>
            <span className={i % 2 === 0 ? "text-gray-900 dark:text-gray-100 font-medium" : ""}>
              {toAlgebraic(m.from.row, m.from.col)}→{toAlgebraic(m.to.row, m.to.col)}
              {m.captures.length > 0 && ` ×${m.captures.length}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
