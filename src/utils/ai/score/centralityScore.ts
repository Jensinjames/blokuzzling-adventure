
import { Piece, BoardPosition } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameConstants';

// Calculate how central the placement is (center placements are better strategically)
export const calculateCentralityScore = (
  piece: Piece, 
  position: BoardPosition
): number => {
  const centerRow = Math.floor(BOARD_SIZE / 2);
  const centerCol = Math.floor(BOARD_SIZE / 2);
  
  // Calculate distance from center for each cell of the piece
  let totalDistance = 0;
  let cellCount = 0;
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const rowDist = Math.abs((position.row + i) - centerRow);
        const colDist = Math.abs((position.col + j) - centerCol);
        totalDistance += (rowDist + colDist);
        cellCount++;
      }
    }
  }
  
  // Invert the score so that smaller distances (more central) get higher scores
  const averageDistance = cellCount > 0 ? totalDistance / cellCount : 0;
  return Math.max(0, 7 - averageDistance); // Enhanced bonus of 0-7 based on centrality
};
