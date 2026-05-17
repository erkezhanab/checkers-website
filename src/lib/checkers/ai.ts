import type { Board, Difficulty, Move, PieceColor } from "@/lib/types";
import { getAllMovesForColor, applyMove, BOARD_SIZE } from "./engine";
import type { GameState } from "@/lib/types";

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 7,
};

export function getBestMove(state: GameState, aiColor: PieceColor, difficulty: Difficulty): Move | null {
  const moves = getAllMovesForColor(state.board, aiColor);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    const captureMoves = moves.filter((m) => m.captures.length > 0);
    const pool = captureMoves.length > 0 ? captureMoves : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const depth = DEPTH_MAP[difficulty];
  const isMaximizing = aiColor === "black";

  let bestMove: Move | null = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const newState = applyMove(state, move);
    const score = minimax(newState, depth - 1, -Infinity, Infinity, !isMaximizing, aiColor);

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor
): number {
  if (depth === 0 || state.status !== "playing") {
    return evaluate(state.board, aiColor);
  }

  const color: PieceColor = isMaximizing
    ? aiColor
    : aiColor === "black"
    ? "red"
    : "black";

  const currentColor = state.chainCapture ? state.currentTurn : color;
  const moves = getAllMovesForColor(state.board, currentColor);

  if (moves.length === 0) {
    return evaluate(state.board, aiColor);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move);
      const score = minimax(newState, depth - 1, alpha, beta, false, aiColor);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move);
      const score = minimax(newState, depth - 1, alpha, beta, true, aiColor);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

function evaluate(board: Board, aiColor: PieceColor): number {
  const humanColor: PieceColor = aiColor === "black" ? "red" : "black";
  let score = 0;

  const centerBonus = [0, 0, 0, 1, 1, 0, 0, 0];
  const center4 = [3, 4];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (!cell) continue;

      const isAI = cell.color === aiColor;
      const pieceValue = cell.type === "king" ? 3 : 1;
      const sign = isAI ? 1 : -1;

      score += sign * pieceValue;

      if (cell.type === "man") {
        const advanceRow = isAI
          ? aiColor === "black"
            ? BOARD_SIZE - 1 - row
            : row
          : 0;
        score += sign * advanceRow * 0.05;
      }

      if (center4.includes(row) && center4.includes(col)) {
        score += sign * 0.3;
      } else if (centerBonus[col] > 0 || centerBonus[row] > 0) {
        score += sign * 0.1;
      }

      const edges = [0, BOARD_SIZE - 1];
      if (edges.includes(col)) score += sign * 0.1;
    }
  }

  return score;
}

export function analyzeGameForCoach(
  moveHistory: Move[],
  boardSnapshots: Board[],
  playerColor: PieceColor
): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const opponentColor: PieceColor = playerColor === "black" ? "red" : "black";

  for (let i = 0; i < moveHistory.length - 1; i++) {
    const move = moveHistory[i];
    const board = boardSnapshots[i];
    const isPlayerMove = i % 2 === (playerColor === "black" ? 0 : 1);
    if (!isPlayerMove) continue;

    const allMoves = getAllMovesForColor(board, playerColor);
    const captureMoves = allMoves.filter((m) => m.captures.length > 0);
    const didCapture = move.captures.length > 0;

    if (!didCapture && captureMoves.length > 0) {
      insights.push({
        moveIndex: i,
        type: "missed_capture",
        description: `Move ${i + 1}: You missed a mandatory capture! You could have captured ${captureMoves[0].captures.length} piece(s).`,
        betterMove: captureMoves[0],
        actualMove: move,
        board,
      });
      if (insights.length >= 3) break;
      continue;
    }

    if (captureMoves.length > 1) {
      const best = captureMoves.reduce((a, b) => (b.captures.length > a.captures.length ? b : a));
      if (move.captures.length < best.captures.length) {
        insights.push({
          moveIndex: i,
          type: "missed_capture",
          description: `Move ${i + 1}: You captured ${move.captures.length} piece(s) but could have captured ${best.captures.length} in a chain!`,
          betterMove: best,
          actualMove: move,
          board,
        });
        if (insights.length >= 3) break;
      }
    }

    const isNearKingRow =
      playerColor === "black"
        ? move.from.row === 1 && move.to.row !== 0
        : move.from.row === BOARD_SIZE - 2 && move.to.row !== BOARD_SIZE - 1;

    const couldHaveKinged = allMoves.some(
      (m) =>
        m.from.row === move.from.row &&
        m.from.col === move.from.col &&
        ((playerColor === "black" && m.to.row === 0) || (playerColor === "red" && m.to.row === BOARD_SIZE - 1))
    );

    if (couldHaveKinged && !isKingMove(move, board, playerColor)) {
      insights.push({
        moveIndex: i,
        type: "missed_king",
        description: `Move ${i + 1}: You could have promoted a piece to king here!`,
        betterMove: allMoves.find(
          (m) =>
            (playerColor === "black" && m.to.row === 0) || (playerColor === "red" && m.to.row === BOARD_SIZE - 1)
        )!,
        actualMove: move,
        board,
      });
      if (insights.length >= 3) break;
    }
  }

  return insights.slice(0, 3);
}

function isKingMove(move: Move, board: Board, color: PieceColor): boolean {
  const piece = board[move.from.row][move.from.col];
  if (!piece || piece.type === "king") return false;
  return (color === "black" && move.to.row === 0) || (color === "red" && move.to.row === BOARD_SIZE - 1);
}

export interface CoachInsight {
  moveIndex: number;
  type: "missed_capture" | "missed_king" | "better_position";
  description: string;
  betterMove: Move;
  actualMove: Move;
  board: Board;
}
