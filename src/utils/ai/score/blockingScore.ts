
import { Piece, BoardPosition, GameState } from '@/types/game';
import { isWithinBounds } from '@/utils/boardValidation';

// Calculate how effectively this move blocks opponent moves
export const calculateBlockingScore = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number
): number => {
  let blockingScore = 0;
  
  // Simulate placing this piece
  const simulatedBoard = JSON.parse(JSON.stringify(gameState.board));
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        if (isWithinBounds(boardRow, boardCol)) {
          simulatedBoard[boardRow][boardCol] = { player: aiPlayerIndex };
        }
      }
    }
  }
  
  // Check if this placement blocks opponent diagonal connections
  // Examine adjacent diagonal cells
  const diagonalDirections = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        // Check diagonals for opponent pieces
        for (const dir of diagonalDirections) {
          const adjRow = boardRow + dir.row;
          const adjCol = boardCol + dir.col;
          
          if (isWithinBounds(adjRow, adjCol) && 
              gameState.board[adjRow][adjCol].player !== null &&
              gameState.board[adjRow][adjCol].player !== aiPlayerIndex) {
            // We found an opponent piece diagonally adjacent
            // This is a good blocking move
            blockingScore += 4; // Increased blocking score
          }
        }
      }
    }
  }
  
  return blockingScore;
};
