export type PieceColor = "red" | "black";
export type PieceType = "man" | "king";

export interface Piece {
  color: PieceColor;
  type: PieceType;
  id: string;
}

export type CellValue = Piece | null;
export type Board = CellValue[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
  isKingMove?: boolean;
}

export type GameMode = "pvp" | "ai";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "playing" | "red_wins" | "black_wins" | "draw";

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  status: GameStatus;
  selectedPiece: Position | null;
  validMoves: Move[];
  moveHistory: Move[];
  capturedPieces: { red: number; black: number };
  mustCapture: boolean;
  chainCapture: Position | null;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PieceColor;
  speedMode?: boolean;
  skinId?: string;
}

export interface CoachMoment {
  moveIndex: number;
  description: string;
  board: Board;
  missedMove: Move;
  actualMove: Move;
  type: "missed_capture" | "missed_king" | "better_position";
}

export interface PlayerStats {
  id: string;
  user_id: string;
  username: string;
  city: string;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  rating: number;
  pro_status: boolean;
  selected_skin: string;
  learn_checkers_completed: boolean;
  game_count: number;
  created_at: string;
}

export interface GameRecord {
  id: string;
  player_id: string;
  opponent_type: "ai" | "human";
  opponent_difficulty?: Difficulty;
  winner: "player" | "opponent" | "draw";
  moves_count: number;
  duration_seconds: number;
  player_color: string;
  created_at: string;
}

export const KAZAKH_CITIES = [
  "Astana",
  "Almaty",
  "Shymkent",
  "Karaganda",
  "Aktobe",
  "Taraz",
  "Pavlodar",
  "Oskemen",
  "Semey",
  "Atyrau",
  "Kostanay",
  "Kyzylorda",
  "Oral",
  "Petropavl",
  "Aktau",
] as const;

export type KazakhCity = (typeof KAZAKH_CITIES)[number];
