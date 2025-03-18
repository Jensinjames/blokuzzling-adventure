
import { Piece, BoardPosition } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameConstants';

// Calculate score for corner placements (more strategic)
export const calculateCornerScore = (
  piece: Piece,
  position: BoardPosition
): number => {
  let cornerScore = 0;
  
  // Define corners of the board
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 }
  ];
  
  // Check if the piece occupies any corners
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        for (const corner of corners) {
          if (boardRow === corner.row && boardCol === corner.col) {
            cornerScore += 10; // High value for controlling a corner
          }
        }
      }
    }
  }
  
  return cornerScore;
};
