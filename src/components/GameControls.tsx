"use client";

import { motion } from "framer-motion";
import { RotateCcw, Flag } from "lucide-react";
import type { GameConfig, GameState, PieceColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface GameControlsProps {
  state: GameState;
  config: GameConfig;
  onReset: () => void;
  isAiThinking?: boolean;
}

export function GameControls({ state, config, onReset, isAiThinking }: GameControlsProps) {
  const { board, currentTurn, capturedPieces, status } = state;
  const { t } = useLanguage();
  const redCount = board.flat().filter((c) => c?.color === "red").length;
  const blackCount = board.flat().filter((c) => c?.color === "black").length;

  const statusText = () => {
    if (status === "red_wins") return t.game.redWins;
    if (status === "black_wins") return t.game.blackWins;
    if (status === "draw") return t.game.draw;
    if (isAiThinking) return t.game.aiThinking;
    return currentTurn === "black" ? t.game.blackTurn : t.game.redTurn;
  };

  const turnColor = currentTurn === "black" ? "from-gray-700 to-gray-900" : "from-red-500 to-red-700";

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        className={cn(
          "rounded-xl p-4 text-white font-semibold text-center text-sm shadow-lg",
          "bg-gradient-to-r",
          status !== "playing" ? "from-amber-500 to-amber-700" : turnColor
        )}
        key={statusText()}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {statusText()}
        {isAiThinking && (
          <span className="ml-2 inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-white rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </span>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <PieceCounter color="black" count={blackCount} captured={capturedPieces.black} label={t.game.black} capturedLabel={t.game.captured} />
        <PieceCounter color="red" count={redCount} captured={capturedPieces.red} label={t.game.red} capturedLabel={t.game.captured} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t.game.newGame}
        </button>
      </div>

      {config.mode === "ai" && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          {t.game.youPlayAs}{" "}
          <span className="font-semibold capitalize">{config.playerColor}</span>
          {" · "}
          {t.game.ai}: <span className="font-semibold capitalize">{config.difficulty}</span>
        </div>
      )}
    </div>
  );
}

function PieceCounter({
  color,
  count,
  captured,
  label,
  capturedLabel,
}: {
  color: PieceColor;
  count: number;
  captured: number;
  label: string;
  capturedLabel: string;
}) {
  return (
    <div className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800 text-center">
      <div
        className={cn(
          "w-8 h-8 rounded-full mx-auto mb-2 shadow-md border-2",
          color === "black"
            ? "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-950"
            : "bg-gradient-to-br from-red-400 to-red-700 border-red-800"
        )}
      />
      <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{count}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      {captured > 0 && (
        <div className="text-xs text-red-500 mt-1">-{captured} {capturedLabel}</div>
      )}
    </div>
  );
}
