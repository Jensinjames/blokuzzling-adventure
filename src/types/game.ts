
export interface BoardPosition {
  row: number;
  col: number;
}

export interface BoardCell {
  player: number | null;
  hasPowerup?: boolean;
  powerupType?: string;
  pieceId?: string;
}

export interface Piece {
  id: string;
  name: string;
  shape: number[][];
  used: boolean;
  hidden?: boolean;
  category?: string;  // New: categorizes pieces (L, T, Z, etc.)
  size?: number;      // New: total number of cells in the piece
  rotation?: number;  // New: current rotation state (0, 90, 180, 270)
  flipped?: boolean;  // New: whether the piece is flipped horizontally
}

export interface Move {
  type: 'place' | 'pass';
  piece?: string;
  position?: BoardPosition;
  timestamp: number;
}

export interface TurnHistoryItem {
  type: 'place' | 'pass' | 'use-powerup';
  player: number;
  piece?: string;
  position?: BoardPosition;
  timestamp: number;
  powerupType?: string;
  targetPosition?: BoardPosition;
  action?: string;     // New: additional context about the move
}

export interface PowerupItem {
  type: string;
  count: number;
}

export interface Player {
  id: number | string;
  name: string;
  color: string;
  pieces: Piece[];
  moveHistory: Move[];
  score: number;
  powerups: PowerupItem[];
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
  version?: number;    // New: track version for sync optimization
  lastUpdate?: number; // New: timestamp for last update
}
