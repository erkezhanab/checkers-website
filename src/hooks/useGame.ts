"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Board, GameConfig, GameState, Position } from "@/lib/types";
import {
  applyMove,
  createInitialGameState,
  selectPiece,
} from "@/lib/checkers/engine";
import { analyzeGameForCoach, getBestMove, type CoachInsight } from "@/lib/checkers/ai";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const BLITZ_SECONDS = 3 * 60;

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(createInitialGameState);
  const [boardSnapshots, setBoardSnapshots] = useState<Board[]>([createInitialGameState().board]);
  const [coachInsights, setCoachInsights] = useState<CoachInsight[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ black: BLITZ_SECONDS, red: BLITZ_SECONDS });
  const [gameSaved, setGameSaved] = useState(false);
  const [startTime] = useState(() => Date.now());

  const aiTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const clockRef = useRef<ReturnType<typeof setInterval>>();

  // Always-current ref so the interval closure never reads a stale turn
  const currentTurnRef = useRef(state.currentTurn);
  useEffect(() => {
    currentTurnRef.current = state.currentTurn;
  }, [state.currentTurn]);

  const isPlayerTurn =
    config.mode === "pvp" || state.currentTurn === config.playerColor;

  // Single persistent interval — reads active color from ref each tick.
  // Does NOT restart on turn changes; that was the bug (AI turn interval
  // was created then destroyed before its first 1-second tick fired).
  useEffect(() => {
    if (!config.speedMode || state.status !== "playing") return;

    clockRef.current = setInterval(() => {
      const color = currentTurnRef.current;
      setTimeLeft((prev) => {
        const next = prev[color] - 1;
        if (next <= 0) {
          setState((s) =>
            s.status !== "playing"
              ? s
              : { ...s, status: color === "black" ? "red_wins" : "black_wins" }
          );
          return { ...prev, [color]: 0 };
        }
        return { ...prev, [color]: next };
      });
    }, 1000);

    return () => clearInterval(clockRef.current);
  }, [config.speedMode, state.status]); // intentionally excludes currentTurn

  const handleCellClick = useCallback(
    (pos: Position) => {
      if (!isPlayerTurn || state.status !== "playing" || isAiThinking) return;

      const existingMove = state.validMoves.find(
        (m) => m.to.row === pos.row && m.to.col === pos.col
      );

      if (existingMove && state.selectedPiece) {
        const newState = applyMove(state, existingMove);
        setState(newState);
        setBoardSnapshots((prev) => [...prev, newState.board]);
        return;
      }

      const clickedPiece = state.board[pos.row][pos.col];
      if (clickedPiece && clickedPiece.color === state.currentTurn) {
        setState((prev) => selectPiece(prev, pos));
        return;
      }

      setState((prev) => ({ ...prev, selectedPiece: null, validMoves: [] }));
    },
    [state, isPlayerTurn, isAiThinking]
  );

  const resetGame = useCallback(() => {
    const initial = createInitialGameState();
    setState(initial);
    setBoardSnapshots([initial.board]);
    setCoachInsights([]);
    setIsAiThinking(false);
    setTimeLeft({ black: BLITZ_SECONDS, red: BLITZ_SECONDS });
    setGameSaved(false);
    clearTimeout(aiTimerRef.current);
    clearInterval(clockRef.current);
  }, []);

  // Game-end: generate coach insights + auto-save (Pro users only)
  useEffect(() => {
    if (state.status === "playing") return;

    clearInterval(clockRef.current);

    const insights = analyzeGameForCoach(state.moveHistory, boardSnapshots, config.playerColor);
    setCoachInsights(insights);

    if (config.mode === "ai" && isSupabaseConfigured() && !gameSaved) {
      setGameSaved(true);
      const winner =
        state.status === "red_wins"
          ? config.playerColor === "red" ? "player" : "opponent"
          : state.status === "black_wins"
          ? config.playerColor === "black" ? "player" : "opponent"
          : "draw";

      const durationSeconds = Math.round((Date.now() - startTime) / 1000);

      // Save directly from client to avoid server-side auth issues
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) return;
        supabase.from("game_records").insert({
          player_id: session.user.id,
          opponent_type: "ai",
          opponent_difficulty: config.difficulty,
          winner,
          moves_count: state.moveHistory.length,
          duration_seconds: durationSeconds,
          player_color: config.playerColor,
        }).then(() => {}, () => {});
      }).catch(() => {});
    }
  }, [state.status]);

  // AI move
  useEffect(() => {
    if (config.mode !== "ai" || state.currentTurn === config.playerColor || state.status !== "playing") {
      return;
    }

    setIsAiThinking(true);
    const delay = config.difficulty === "easy" ? 400 : config.difficulty === "medium" ? 700 : 1000;

    aiTimerRef.current = setTimeout(() => {
      const move = getBestMove(state, state.currentTurn, config.difficulty);
      if (move) {
        const newState = applyMove(state, move);
        setState(newState);
        setBoardSnapshots((prev) => [...prev, newState.board]);
      }
      setIsAiThinking(false);
    }, delay);

    return () => clearTimeout(aiTimerRef.current);
  }, [state.currentTurn, state.status, config.mode, config.playerColor, config.difficulty]);

  return {
    state,
    coachInsights,
    isAiThinking,
    timeLeft,
    handleCellClick,
    resetGame,
  };
}
