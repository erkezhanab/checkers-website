"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { PieceColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface SpeedTimerProps {
  timeLeft: { black: number; red: number };
  currentTurn: PieceColor;
  isPlaying: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SpeedTimer({ timeLeft, currentTurn, isPlaying }: SpeedTimerProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.timer.blitzMode}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["black", "red"] as PieceColor[]).map((color) => {
          const time = timeLeft[color];
          const isActive = currentTurn === color && isPlaying;
          const isDanger = time <= 30;

          return (
            <div
              key={color}
              className={cn(
                "rounded-lg px-3 py-2 text-center transition-all",
                isActive
                  ? isDanger
                    ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-400"
                    : "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400"
                  : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent"
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border",
                    color === "black"
                      ? "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-900"
                      : "bg-gradient-to-br from-red-400 to-red-700 border-red-800"
                  )}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{color === "black" ? t.game.black : t.game.red}</span>
              </div>
              <motion.div
                key={time}
                animate={isActive && isDanger ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: isActive && isDanger ? Infinity : 0 }}
                className={cn(
                  "text-xl font-mono font-bold tabular-nums",
                  isDanger
                    ? "text-red-600 dark:text-red-400"
                    : isActive
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {formatTime(time)}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
