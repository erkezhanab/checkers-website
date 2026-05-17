import type { Board, CellValue, GameState, GameStatus, Move, Piece, PieceColor, Position } from "@/lib/types";

export const BOARD_SIZE = 8;

export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { color: "red", type: "man", id: `r-${row}-${col}` };
        } else if (row > 4) {
          board[row][col] = { color: "black", type: "man", id: `b-${row}-${col}` };
        }
      }
    }
  }
  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: "black",
    status: "playing",
    selectedPiece: null,
    validMoves: [],
    moveHistory: [],
    capturedPieces: { red: 0, black: 0 },
    mustCapture: false,
    chainCapture: null,
  };
}

function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function opponent(color: PieceColor): PieceColor {
  return color === "red" ? "black" : "red";
}

export function getMovesForPiece(board: Board, pos: Position, chainFrom?: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const captures = getCapturesForPiece(board, pos, chainFrom);
  if (captures.length > 0) return captures;

  return getSimpleMovesForPiece(board, pos);
}

function getSimpleMovesForPiece(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const newRow = pos.row + dr;
    const newCol = pos.col + dc;

    if (isOnBoard(newRow, newCol) && board[newRow][newCol] === null) {
      moves.push({ from: pos, to: { row: newRow, col: newCol }, captures: [] });
    }
  }

  return moves;
}

export function getCapturesForPiece(board: Board, pos: Position, originPos?: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const captures: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const midRow = pos.row + dr;
    const midCol = pos.col + dc;
    const landRow = pos.row + dr * 2;
    const landCol = pos.col + dc * 2;

    if (!isOnBoard(midRow, midCol) || !isOnBoard(landRow, landCol)) continue;

    const midPiece = board[midRow][midCol];
    const landCell = board[landRow][landCol];

    if (midPiece && midPiece.color === opponent(piece.color) && landCell === null) {
      const capturePos = { row: midRow, col: midCol };
      const landPos = { row: landRow, col: landCol };

      if (originPos && landRow === originPos.row && landCol === originPos.col) continue;

      const moveWithCapture: Move = {
        from: pos,
        to: landPos,
        captures: [capturePos],
      };

      const boardAfter = applyMoveToBoard(board, moveWithCapture, true);
      const chainCaptures = getCapturesForPiece(boardAfter, landPos, pos);

      if (chainCaptures.length > 0) {
        for (const chain of chainCaptures) {
          captures.push({
            from: pos,
            to: chain.to,
            captures: [capturePos, ...chain.captures],
          });
        }
      } else {
        captures.push(moveWithCapture);
      }
    }
  }

  return captures;
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.type === "king") {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  }
  return piece.color === "black"
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];
}

export function getAllMovesForColor(board: Board, color: PieceColor): Move[] {
  const captures: Move[] = [];
  const simples: Move[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;

      const pos = { row, col };
      const pieceMoves = getMovesForPiece(board, pos);

      for (const move of pieceMoves) {
        if (move.captures.length > 0) {
          captures.push(move);
        } else {
          simples.push(move);
        }
      }
    }
  }

  return captures.length > 0 ? captures : simples;
}

function applyMoveToBoard(board: Board, move: Move, keepOriginal = false): Board {
  const newBoard: Board = board.map((row) => [...row]);
  const piece = newBoard[move.from.row][move.from.col];
  if (!piece) return newBoard;

  if (!keepOriginal) {
    newBoard[move.from.row][move.from.col] = null;
  }

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  const shouldPromote =
    piece.type === "man" &&
    ((piece.color === "black" && move.to.row === 0) ||
      (piece.color === "red" && move.to.row === BOARD_SIZE - 1));

  newBoard[move.to.row][move.to.col] = shouldPromote
    ? { ...piece, type: "king" }
    : { ...piece };

  return newBoard;
}

export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = applyMoveToBoard(state.board, move);
  const piece = state.board[move.from.row][move.from.col]!;
  const newHistory = [...state.moveHistory, move];
  const newCaptured = {
    red: state.capturedPieces.red + (piece.color === "black" ? move.captures.length : 0),
    black: state.capturedPieces.black + (piece.color === "red" ? move.captures.length : 0),
  };

  const wasPromoted =
    piece.type === "man" &&
    ((piece.color === "black" && move.to.row === 0) ||
      (piece.color === "red" && move.to.row === BOARD_SIZE - 1));

  let chainCapture: Position | null = null;
  let nextTurn = opponent(state.currentTurn);

  if (move.captures.length > 0 && !wasPromoted) {
    const furtherCaptures = getCapturesForPiece(newBoard, move.to, move.from);
    if (furtherCaptures.length > 0) {
      chainCapture = move.to;
      nextTurn = state.currentTurn;
    }
  }

  const status = determineGameStatus(newBoard, nextTurn, chainCapture);

  return {
    board: newBoard,
    currentTurn: nextTurn,
    status,
    selectedPiece: null,
    validMoves: [],
    moveHistory: newHistory,
    capturedPieces: newCaptured,
    mustCapture: false,
    chainCapture,
  };
}

function determineGameStatus(board: Board, currentTurn: PieceColor, chainCapture: Position | null): GameStatus {
  if (chainCapture) return "playing";

  const moves = getAllMovesForColor(board, currentTurn);
  if (moves.length === 0) {
    return currentTurn === "black" ? "red_wins" : "black_wins";
  }

  const redPieces = board.flat().filter((c) => c?.color === "red").length;
  const blackPieces = board.flat().filter((c) => c?.color === "black").length;

  if (redPieces === 0) return "black_wins";
  if (blackPieces === 0) return "red_wins";

  return "playing";
}

export function selectPiece(state: GameState, pos: Position): GameState {
  const piece = state.board[pos.row][pos.col];
  if (!piece || piece.color !== state.currentTurn) return state;

  if (state.chainCapture) {
    if (pos.row !== state.chainCapture.row || pos.col !== state.chainCapture.col) return state;
  }

  const allMoves = getAllMovesForColor(state.board, state.currentTurn);
  const hasMandatoryCapture = allMoves.some((m) => m.captures.length > 0);

  let pieceMoves = getMovesForPiece(state.board, pos, state.chainCapture ?? undefined);

  if (hasMandatoryCapture) {
    pieceMoves = pieceMoves.filter((m) => m.captures.length > 0);
  }

  return {
    ...state,
    selectedPiece: pos,
    validMoves: pieceMoves,
    mustCapture: hasMandatoryCapture,
  };
}

export function countPieces(board: Board): { red: number; black: number } {
  let red = 0;
  let black = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.color === "red") red++;
      if (cell?.color === "black") black++;
    }
  }
  return { red, black };
}
