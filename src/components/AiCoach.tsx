"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Lightbulb, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { CoachInsight } from "@/lib/checkers/ai";
import type { GameState, PieceColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

type InsightType = "missed_capture" | "missed_king" | "positional_error" | "good_move" | "better_position";

interface UnifiedInsight {
  moveIndex: number;
  type: InsightType;
  description: string;
}

const typeConfig: Record<InsightType, { icon: string; bg: string }> = {
  missed_capture: { icon: "⚔️", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  missed_king:    { icon: "♛",  bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  better_position:{ icon: "📍", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  positional_error:{ icon: "⚠️",bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
  good_move:      { icon: "✨", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
};

interface AiCoachProps {
  insights: CoachInsight[];
  gameState?: GameState;
  playerColor?: PieceColor;
}

export function AiCoach({ insights: localInsights, gameState, playerColor }: AiCoachProps) {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [apiInsights, setApiInsights] = useState<UnifiedInsight[]>([]);
  const [apiLoading, setApiLoading] = useState(
    () => !!gameState && gameState.status !== "playing" && gameState.moveHistory.length >= 2
  );
  const [source, setSource] = useState<"local" | "gemini" | "claude">("local");
  const [apiSource, setApiSource] = useState<"gemini" | "claude">("gemini");

  const localUnified: UnifiedInsight[] = localInsights.map((i) => ({
    moveIndex: i.moveIndex,
    type: i.type as InsightType,
    description: i.description,
  }));

  const displayedInsights = source !== "local" ? apiInsights : localUnified;

  useEffect(() => {
    if (!gameState || gameState.status === "playing") return;
    if (gameState.moveHistory.length < 2) return;

    setApiLoading(true);

    fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moveHistory: gameState.moveHistory,
        winner: gameState.status,
        playerColor,
        capturedPieces: gameState.capturedPieces,
        lang,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.insights?.length > 0) {
          const src: "gemini" | "claude" = data.source === "claude" ? "claude" : "gemini";
          setApiInsights(data.insights.map((ins: { moveIndex: number; type: InsightType; description: string }) => ({
            moveIndex: ins.moveIndex,
            type: ins.type,
            description: ins.description,
          })));
          setSource(src);
          setApiSource(src);
        }
      })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, [gameState?.status]);

  if (localInsights.length === 0 && !apiLoading) return null;

  const poweredByLabel = source === "claude" ? t.coach.poweredByClaude : t.coach.poweredByGemini;
  const tryOtherLabel = apiSource === "claude" ? t.coach.tryClaude : t.coach.tryGemini;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800">
          {apiLoading ? (
            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-300 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-300" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">{t.coach.title}</span>
            {(source === "gemini" || source === "claude") && (
              <span className="flex items-center gap-1 text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />{poweredByLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            {apiLoading
              ? t.coach.analyzing
              : displayedInsights.length > 0
              ? t.coach.keyMoments.replace("{n}", String(displayedInsights.length))
              : t.coach.noInsights}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              {apiLoading && displayedInsights.length === 0 && (
                <div className="flex items-center gap-3 py-4 text-purple-600 dark:text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="text-sm">{t.coach.analyzing}</span>
                </div>
              )}

              {displayedInsights.map((insight, i) => {
                const cfg = typeConfig[insight.type] ?? typeConfig.better_position;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn("rounded-lg border p-3 text-sm", cfg.bg)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5 flex-shrink-0">{cfg.icon}</span>
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight.description}</p>
                        {insight.moveIndex > 0 && (
                          <span className="text-xs text-gray-400 mt-1 block">{t.coach.move}{insight.moveIndex}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {(source === "gemini" || source === "claude") && (
                <button
                  onClick={() => setSource("local")}
                  className="text-xs text-purple-500 hover:text-purple-700 text-left"
                >
                  {t.coach.switchToRuleBased}
                </button>
              )}
              {source === "local" && apiInsights.length > 0 && (
                <button
                  onClick={() => setSource(apiSource)}
                  className="text-xs text-purple-500 hover:text-purple-700 text-left flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />{tryOtherLabel}
                </button>
              )}

              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Lightbulb className="w-3 h-3" />
                <span>{t.coach.reviewMoments}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
