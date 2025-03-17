
export interface BoardCell {
  player: number | null;
  pieceId?: string;
  hasPowerup?: boolean;
  powerupType?: string;
}

export interface BoardPosition {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  shape: number[][];
  name: string;
  used: boolean;
  hidden?: boolean;
}

export interface Move {
  type: 'place' | 'pass' | 'use-powerup';
  piece?: string;
  position?: BoardPosition;
  powerupType?: string;
  targetPosition?: BoardPosition;
  timestamp: number;
}

export interface Player {
  id: number | string;  // Updated to support both numeric IDs and UUID strings
  name: string;
  color: string;
  moveHistory: Move[];
  pieces: Piece[];
  score: number;
  powerups: {
    type: string;
    count: number;
  }[];
}

export interface TurnHistoryItem {
  type: string;
  player: number;
  piece?: string;
  position?: BoardPosition;
  powerupType?: string;
  targetPosition?: BoardPosition;
  timestamp: number;
}

export interface GameState {
  board: BoardCell[][];
  players: Player[];
  currentPlayer: number;
  turnHistory: TurnHistoryItem[];
  gameStats: {
    totalMoves: number;
    gameStartTime: number;
    lastMoveTime: number;
  };
  gameStatus: 'waiting' | 'playing' | 'finished' | 'completed';
  winner: number | null;
  powerupCells?: BoardPosition[];
}
