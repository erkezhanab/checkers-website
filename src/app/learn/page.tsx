"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, Trophy, RotateCcw, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Board, GameState, Move, PieceColor, Position } from "@/lib/types";
import { applyMove, selectPiece, createInitialGameState } from "@/lib/checkers/engine";
import { Board as BoardUI } from "@/components/Board";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

// ─── Tutorial step definitions ───────────────────────────────────────────────

function emptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

function piece(color: PieceColor, type: "man" | "king" = "man", id: string) {
  return { color, type, id };
}

interface TutorialStep {
  id: number;
  title: string;
  instructions: string;
  hint: string;
  board: Board;
  validationFn: (move: Move, before: Board) => boolean;
  successMessage: string;
}

const STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Moving a Piece",
    instructions: "Pieces move diagonally forward only. Click the black piece, then click one of the glowing dots to move it.",
    hint: "Click the black piece first — glowing dots will show where you can go.",
    board: (() => {
      const b = emptyBoard();
      b[5][2] = piece("black", "man", "t1-b1");
      return b;
    })(),
    validationFn: (move) => move.captures.length === 0,
    successMessage: "Perfect! You moved diagonally forward. That's all a basic piece can do.",
  },
  {
    id: 2,
    title: "Capturing an Opponent",
    instructions: "Jump OVER a red piece to capture it! When a capture is available you MUST take it.",
    hint: "Click the black piece — it has one move that jumps over the red piece.",
    board: (() => {
      const b = emptyBoard();
      b[4][1] = piece("black", "man", "t2-b1");
      b[3][2] = piece("red",   "man", "t2-r1");
      return b;
    })(),
    validationFn: (move) => move.captures.length >= 1,
    successMessage: "Excellent! You captured a red piece by jumping over it!",
  },
  {
    id: 3,
    title: "Chain Captures",
    instructions: "You can capture multiple pieces in a single turn by chaining jumps! Capture both red pieces.",
    hint: "Click the black piece. It can jump twice in one move — take them both!",
    board: (() => {
      const b = emptyBoard();
      b[6][1] = piece("black", "man", "t3-b1");
      b[5][2] = piece("red",   "man", "t3-r1");
      b[3][4] = piece("red",   "man", "t3-r2");
      return b;
    })(),
    validationFn: (move) => move.captures.length >= 2,
    successMessage: "Incredible! A double capture in one move — that's advanced play!",
  },
  {
    id: 4,
    title: "Becoming a King",
    instructions: "When a piece reaches the opponent's back row (row 0, the very top), it becomes a King ♛ and can move in all 4 directions!",
    hint: "The black piece is one step from the top. Move it diagonally to either corner — it will be crowned.",
    board: (() => {
      const b = emptyBoard();
      b[1][2] = piece("black", "man", "t4-b1");
      return b;
    })(),
    validationFn: (move) => move.to.row === 0,
    successMessage: "👑 You have a King! Notice the crown symbol — Kings can now move backwards too.",
  },
  {
    id: 5,
    title: "King Power",
    instructions: "A King can move AND capture in all 4 diagonal directions — including backwards. Capture the red piece that is behind the king.",
    hint: "The black King is at the center. The red piece is below it. Jump over it!",
    board: (() => {
      const b = emptyBoard();
      b[3][4] = piece("black", "king", "t5-b1");
      b[4][5] = piece("red",   "man",  "t5-r1");
      return b;
    })(),
    validationFn: (move) => move.captures.length >= 1 && move.to.row > 3,
    successMessage: "Kings dominate the board — guard them and use them to control both directions!",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type PageStatus = "loading" | "already_completed" | "in_progress";

export default function LearnPage() {
  const { t } = useLanguage();
  const steps = useMemo(
    () => STEPS.map((s, i) => ({
      ...s,
      title: t.learnSteps[i]?.title ?? s.title,
      instructions: t.learnSteps[i]?.instructions ?? s.instructions,
      hint: t.learnSteps[i]?.hint ?? s.hint,
      successMessage: t.learnSteps[i]?.success ?? s.successMessage,
    })),
    [t]
  );
  const [pageStatus, setPageStatus] = useState<PageStatus>("in_progress");
  const [stepIdx, setStepIdx] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => stateFromStep(STEPS[0]));
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [allDone, setAllDone] = useState(false);

  // Refs so handleCellClick always reads the latest values without stale closures
  const stepIdxRef = useRef(stepIdx);
  const showSuccessRef = useRef(showSuccess);
  const didAdvanceRef = useRef(false); // guard against double-fire
  stepIdxRef.current = stepIdx;
  showSuccessRef.current = showSuccess;

  // Check DB for completion in background — don't block page render
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) return;
      supabase
        .from("player_stats")
        .select("learn_checkers_completed")
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data: stats }) => {
          if (stats?.learn_checkers_completed) setPageStatus("already_completed");
        });
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveCompletion = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // learn_completed column does not exist in profiles — skipping
    }
  };

  const step = steps[stepIdx];

  const handleCellClick = useCallback(
    (pos: Position) => {
      if (showSuccessRef.current) return;

      // Always read the current step from the ref — prevents stale closure bugs
      const currentStep = steps[stepIdxRef.current];

      const existingMove = gameState.validMoves.find(
        (m) => m.to.row === pos.row && m.to.col === pos.col
      );

      if (existingMove && gameState.selectedPiece) {
        const valid = currentStep.validationFn(existingMove, gameState.board);
        console.log("current step:", stepIdxRef.current + 1, "| valid move:", valid, "| captures:", existingMove.captures.length);
        if (valid && !didAdvanceRef.current) {
          didAdvanceRef.current = true;
          console.log("advancing to step:", stepIdxRef.current + 2);
          const newState = applyMove(gameState, existingMove);
          setGameState(newState);
          setCompleted((prev) => new Set(prev).add(currentStep.id));
          setShowSuccess(true);
          return;
        }
        const newState = applyMove(gameState, existingMove);
        setGameState(newState);
        return;
      }

      const clickedPiece = gameState.board[pos.row][pos.col];
      if (clickedPiece && clickedPiece.color === "black") {
        setGameState((prev) => selectPiece(prev, pos));
      } else {
        setGameState((prev) => ({ ...prev, selectedPiece: null, validMoves: [] }));
      }
    },
    [gameState, steps]  // steps is stable (useMemo); no longer depends on step or showSuccess
  );

  const goNext = async () => {
    const nextIdx = stepIdxRef.current + 1;
    console.log("goNext: current step index:", stepIdxRef.current, "→ next:", nextIdx);
    didAdvanceRef.current = false;
    if (nextIdx >= STEPS.length) {
      await saveCompletion();
      window.location.href = '/';
      return;
    }
    setStepIdx(nextIdx);
    setGameState(stateFromStep(STEPS[nextIdx]));
    setShowSuccess(false);
  };

  const resetStep = () => {
    didAdvanceRef.current = false;
    setGameState(stateFromStep(STEPS[stepIdxRef.current]));
    setShowSuccess(false);
  };

  const startFresh = () => {
    setPageStatus("in_progress");
    setStepIdx(0);
    setGameState(stateFromStep(STEPS[0]));
    setCompleted(new Set());
    setShowSuccess(false);
    setAllDone(false);
  };

  if (pageStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageStatus === "already_completed") {
    return <AlreadyCompletedScreen onRedo={startFresh} />;
  }

  if (allDone) return <AllDoneScreen completedCount={completed.size} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.learn.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.learn.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { didAdvanceRef.current = false; setStepIdx(i); setGameState(stateFromStep(s)); setShowSuccess(false); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              i === stepIdx
                ? "bg-amber-500 text-white"
                : completed.has(s.id)
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}
          >
            {completed.has(s.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">{i + 1}</span>}
            {s.title}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="flex flex-col items-center gap-4">
          <BoardUI state={gameState} onCellClick={handleCellClick} />
          <button
            onClick={resetStep}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <RotateCcw className="w-4 h-4" /> {t.learn.resetStep}
          </button>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-4">
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              {t.learn.stepWord} {stepIdx + 1} {t.learn.ofWord} {STEPS.length}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{step.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{step.instructions}</p>

            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
              <span className="text-lg leading-none">💡</span>
              <span>{step.hint}</span>
            </div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-5 text-center"
              >
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4">{step.successMessage}</p>
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                >
                  {stepIdx + 1 < STEPS.length ? (
                    <><ChevronRight className="w-4 h-4" /> {t.learn.nextStep}</>
                  ) : (
                    <><Trophy className="w-4 h-4" /> {t.learn.finishTutorial}</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function stateFromStep(step: TutorialStep): GameState {
  return {
    ...createInitialGameState(),
    board: step.board.map((row) => [...row]),
    currentTurn: "black",
    status: "playing",
  };
}

function AlreadyCompletedScreen({ onRedo }: { onRedo: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-4">🏆</div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold mb-4">
          <CheckCircle2 className="w-4 h-4" /> {t.learn.tutorialCompleted}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t.learn.alreadyTitle}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t.learn.alreadyDesc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <PlayCircle className="w-5 h-5" /> {t.learn.playVsAi}
          </Link>
          <button
            onClick={onRedo}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> {t.learn.redoTutorial}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AllDoneScreen({ completedCount }: { completedCount: number }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-6">🏆</div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> {t.learn.savedToProfile}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t.learn.allDoneTitle}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          {t.learn.allDoneDesc1.replace("{n}", String(completedCount)).replace("{total}", String(STEPS.length))}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t.learn.allDoneDesc2}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <PlayCircle className="w-5 h-5" /> {t.learn.playVsAi}
          </Link>
          <Link
            href="/learn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> {t.learn.redoTutorial}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
