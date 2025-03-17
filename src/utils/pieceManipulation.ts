
import { Piece } from '@/types/game';

export const rotatePiece = (piece: Piece): number[][] => {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  
  // Create a new rotated matrix
  const rotated: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  // Perform rotation (90 degrees clockwise)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = piece.shape[i][j];
    }
  }
  
  return rotated;
};

export const flipPiece = (piece: Piece): number[][] => {
  // Create a new flipped matrix (horizontal flip)
  return piece.shape.map(row => [...row].reverse());
};

export const calculateScore = (pieces: Piece[]): number => {
  let score = 0;
  
  // Calculate score based on remaining unused pieces
  for (const piece of pieces) {
    if (!piece.used) {
      // Count the number of cells in the piece
      const cellCount = piece.shape.reduce((acc, row) => 
        acc + row.reduce((sum, cell) => sum + cell, 0), 0);
      
      // Subtract from score
      score -= cellCount;
    } else {
      // Add to score based on the size of the piece
      const cellCount = piece.shape.reduce((acc, row) => 
        acc + row.reduce((sum, cell) => sum + cell, 0), 0);
      
      score += cellCount;
    }
  }
  
  return score;
};
