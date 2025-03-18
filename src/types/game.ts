export interface BoardPosition {
  row: number;
  col: number;
}

export interface BoardCell {
  player: number | null;
  hasPowerup?: boolean;
  powerupType?: string;
}

export interface Piece {
  id: string;
  name: string;
  shape: number[][];
  used: boolean;
}

export interface Move {
  type: 'place' | 'pass';
  piece?: string;
  position?: BoardPosition;
  timestamp: number;
}

export interface TurnHistoryItem {
  type: 'place' | 'pass';
  player: number;
  piece?: string;
  position?: BoardPosition;
  timestamp: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  pieces: Piece[];
  moveHistory: Move[];
  score: number;
  powerups: string[];
  isAI?: boolean;
  aiDifficulty?: string;
}

export interface GameStats {
  totalMoves: number;
  gameStartTime: number;
  lastMoveTime: number;
}

export interface GameState {
  board: BoardCell[][];
  players: Player[];
  currentPlayer: number;
  turnHistory: TurnHistoryItem[];
  gameStats: GameStats;
  gameStatus: 'waiting' | 'playing' | 'finished' | 'completed';
  winner: number | null;
  powerupCells?: BoardPosition[];
}
