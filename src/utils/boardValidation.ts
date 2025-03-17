
import { BoardCell, BoardPosition } from '@/types/game';
import { startingCorners, BOARD_SIZE } from './gameConstants';

export const getStartingCorner = (currentPlayer: number): BoardPosition => startingCorners[currentPlayer];

export const isWithinBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const validatePiecePlacement = (
  piece: any,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  if (!piece || !boardPosition) return false;
  
  // Check if piece is within bounds
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check if within board bounds
        if (!isWithinBounds(boardRow, boardCol)) {
          return false;
        }
        
        // Check if cell is already occupied
        if (board[boardRow][boardCol].player !== null) {
          return false;
        }
      }
    }
  }
  
  // Check if this is the first piece for this player
  const hasPlacedPiece = board.some(row => row.some(cell => cell.player === currentPlayer));
  
  if (!hasPlacedPiece) {
    // First piece must cover the starting corner
    const requiredCorner = getStartingCorner(currentPlayer);
    return coversStartingCorner(piece, boardPosition, requiredCorner);
  } else {
    // Subsequent pieces must connect diagonally to the player's own pieces
    return touchesOwnDiagonal(piece, boardPosition, board, currentPlayer) && 
           !touchesSide(piece, boardPosition, board, currentPlayer);
  }
};

export const coversStartingCorner = (
  piece: any,
  boardPosition: BoardPosition,
  requiredCorner: BoardPosition
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        if (boardRow === requiredCorner.row && boardCol === requiredCorner.col) {
          return true;
        }
      }
    }
  }
  return false;
};

export const touchesOwnDiagonal = (
  piece: any,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check diagonals
        const diagonals = [
          { row: boardRow - 1, col: boardCol - 1 },
          { row: boardRow - 1, col: boardCol + 1 },
          { row: boardRow + 1, col: boardCol - 1 },
          { row: boardRow + 1, col: boardCol + 1 },
        ];
        
        for (const diag of diagonals) {
          if (isWithinBounds(diag.row, diag.col) && 
              board[diag.row][diag.col].player === currentPlayer) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const touchesSide = (
  piece: any,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check orthogonal adjacency
        const adjacents = [
          { row: boardRow - 1, col: boardCol },
          { row: boardRow + 1, col: boardCol },
          { row: boardRow, col: boardCol - 1 },
          { row: boardRow, col: boardCol + 1 },
        ];
        
        for (const adj of adjacents) {
          if (isWithinBounds(adj.row, adj.col) && 
              board[adj.row][adj.col].player === currentPlayer) {
            return true;
          }
        }
      }
    }
  }
  return false;
};
