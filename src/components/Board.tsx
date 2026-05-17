"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Board as BoardType, GameState, Position } from "@/lib/types";
import { BOARD_SIZE } from "@/lib/checkers/engine";
import { cn } from "@/lib/utils";
import { getSkin, type Skin } from "@/lib/skins";

interface BoardProps {
  state: GameState;
  onCellClick: (pos: Position) => void;
  flipped?: boolean;
  skinId?: string;
}

export function Board({ state, onCellClick, flipped = false, skinId }: BoardProps) {
  const { board, selectedPiece, validMoves } = state;
  const skin = getSkin(skinId);

  const isSelected = (row: number, col: number) =>
    selectedPiece?.row === row && selectedPiece?.col === col;

  const isValidMove = (row: number, col: number) =>
    validMoves.some((m) => m.to.row === row && m.to.col === col);

  const isCaptureTarget = (row: number, col: number) =>
    validMoves.some((m) => m.captures.some((c) => c.row === row && c.col === col));

  const rows = flipped ? [...Array(BOARD_SIZE)].map((_, i) => BOARD_SIZE - 1 - i) : [...Array(BOARD_SIZE)].map((_, i) => i);
  const cols = flipped ? [...Array(BOARD_SIZE)].map((_, i) => BOARD_SIZE - 1 - i) : [...Array(BOARD_SIZE)].map((_, i) => i);

  return (
    <div className="relative select-none">
      <div
        className="border-2 border-amber-900/50 dark:border-amber-700/50 rounded-lg overflow-hidden shadow-2xl"
        style={{ background: skin.boardDark }}
      >
        {rows.map((row) => (
          <div key={row} className="flex">
            {cols.map((col) => {
              const isDark = (row + col) % 2 === 1;
              const piece = board[row][col];
              const selected = isSelected(row, col);
              const validMove = isValidMove(row, col);
              const captureTarget = isCaptureTarget(row, col);

              return (
                <Cell
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  isDark={isDark}
                  piece={piece}
                  selected={selected}
                  validMove={validMove}
                  captureTarget={captureTarget}
                  onClick={() => onCellClick({ row, col })}
                  skin={skin}
                />
              );
            })}
          </div>
        ))}
      </div>

      <BoardLabels flipped={flipped} />
    </div>
  );
}

interface CellProps {
  row: number;
  col: number;
  isDark: boolean;
  piece: BoardType[0][0];
  selected: boolean;
  validMove: boolean;
  captureTarget: boolean;
  onClick: () => void;
  skin: Skin;
}

function Cell({ row, col, isDark, piece, selected, validMove, captureTarget, onClick, skin }: CellProps) {
  const cellStyle: React.CSSProperties = isDark
    ? {
        backgroundColor: selected
          ? "#b45309"
          : validMove
          ? "#d97706"
          : skin.boardDark,
      }
    : { backgroundColor: skin.boardLight };

  const pieceStyle =
    piece?.color === "red"
      ? {
          background: skin.redStyle.background,
          borderColor: skin.redStyle.borderColor,
        }
      : {
          background: skin.blackStyle.background,
          borderColor: skin.blackStyle.borderColor,
        };

  const shimmerColor =
    piece?.color === "red" ? skin.redStyle.shimmerColor : skin.blackStyle.shimmerColor;

  return (
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center relative cursor-pointer transition-colors duration-150"
      style={cellStyle}
      onClick={isDark ? onClick : undefined}
    >
      {isDark && validMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-amber-400/60 border-2 border-amber-400 animate-pulse" />
        </div>
      )}

      {captureTarget && piece && (
        <div className="absolute inset-0 bg-red-500/30 border-2 border-red-500 rounded-sm pointer-events-none z-10" />
      )}

      <AnimatePresence mode="popLayout">
        {piece && (
          <motion.div
            key={piece.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            layout
            className={cn(
              "w-4/5 h-4/5 rounded-full relative z-20 cursor-pointer",
              "shadow-lg border-2 transition-transform duration-150",
              selected && "ring-2 ring-yellow-400 ring-offset-1 scale-105",
              !selected && "hover:scale-105"
            )}
            style={pieceStyle}
          >
            {piece.type === "king" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-yellow-300 text-xs sm:text-sm font-bold drop-shadow">♛</span>
              </div>
            )}
            <div
              className="absolute inset-1 rounded-full opacity-25"
              style={{ backgroundColor: shimmerColor }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BoardLabels({ flipped }: { flipped: boolean }) {
  const files = flipped ? "hgfedcba" : "abcdefgh";
  const ranks = flipped ? "12345678" : "87654321";

  return (
    <>
      <div className="absolute -bottom-5 left-0 right-0 flex">
        {files.split("").map((f) => (
          <div key={f} className="w-10 sm:w-12 md:w-14 text-center text-xs text-gray-500 dark:text-gray-400">
            {f}
          </div>
        ))}
      </div>
      <div className="absolute -right-4 top-0 bottom-0 flex flex-col">
        {ranks.split("").map((r) => (
          <div key={r} className="h-10 sm:h-12 md:h-14 flex items-center text-xs text-gray-500 dark:text-gray-400">
            {r}
          </div>
        ))}
      </div>
    </>
  );
}
