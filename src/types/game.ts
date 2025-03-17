
export interface BoardCell {
  player: number | null;
  pieceId?: string;
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
}

export interface Move {
  type: 'place' | 'pass';
  piece?: string;
  position?: BoardPosition;
  timestamp: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  moveHistory: Move[];
  pieces: Piece[];
  score: number;
}

export interface TurnHistoryItem {
  type: string;
  player: number;
  piece?: string;
  position?: BoardPosition;
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
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: number | null;
}
