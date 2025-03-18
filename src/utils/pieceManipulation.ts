
import { Piece } from '@/types/game';
import { countPieceCells } from './pieceUtils';

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
  
  // Update rotation state
  const newRotation = ((piece.rotation || 0) + 90) % 360;
  
  return rotated;
};

export const flipPiece = (piece: Piece): number[][] => {
  // Create a new flipped matrix (horizontal flip)
  const flipped = piece.shape.map(row => [...row].reverse());
  
  // Toggle flipped state
  return flipped;
};

export const calculateScore = (pieces: Piece[]): number => {
  let score = 0;
  
  // Calculate score based on remaining unused pieces
  for (const piece of pieces) {
    if (!piece.used) {
      // Count the number of cells in the piece or use the cached size
      const cellCount = piece.size || countPieceCells(piece.shape);
      
      // Subtract from score
      score -= cellCount;
    } else {
      // Add to score based on the size of the piece or use the cached size
      const cellCount = piece.size || countPieceCells(piece.shape);
      
      score += cellCount;
    }
  }
  
  return score;
};

// Update a piece with rotation or flip changes
export const updatePieceState = (piece: Piece, newShape: number[][], operation: 'rotate' | 'flip'): Piece => {
  let newRotation = piece.rotation || 0;
  let newFlipped = piece.flipped || false;
  
  if (operation === 'rotate') {
    newRotation = (newRotation + 90) % 360;
  } else if (operation === 'flip') {
    newFlipped = !newFlipped;
  }
  
  return {
    ...piece,
    shape: newShape,
    rotation: newRotation,
    flipped: newFlipped
  };
};

// Get optimal display dimensions for a piece
export const getPieceDisplayDimensions = (piece: Piece, cellSize: number = 24): { width: number, height: number } => {
  if (!piece.shape || !piece.shape.length) {
    return { width: 0, height: 0 };
  }
  
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  
  return {
    width: cols * cellSize,
    height: rows * cellSize
  };
};
