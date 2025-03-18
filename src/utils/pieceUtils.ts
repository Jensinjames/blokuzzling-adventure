
import { Piece } from '@/types/game';

// Define piece categories
export enum PieceCategory {
  SINGLE = 'single',
  STRAIGHT = 'straight',
  L_SHAPE = 'l-shape',
  T_SHAPE = 't-shape',
  Z_SHAPE = 'z-shape',
  SQUARE = 'square',
  COMPLEX = 'complex'
}

// Unique piece definitions with standardized naming and categorization
export const UNIQUE_PIECE_DEFINITIONS = [
  // Single (1x1)
  {
    id: 'single',
    name: 'Single Cube',
    shape: [[1]],
    category: PieceCategory.SINGLE,
    size: 1
  },
  
  // Straight pieces (line shapes)
  {
    id: 'line-2',
    name: 'Line (2)',
    shape: [[1, 1]],
    category: PieceCategory.STRAIGHT,
    size: 2
  },
  {
    id: 'line-3',
    name: 'Line (3)',
    shape: [[1, 1, 1]],
    category: PieceCategory.STRAIGHT,
    size: 3
  },
  {
    id: 'line-4',
    name: 'Line (4)',
    shape: [[1, 1, 1, 1]],
    category: PieceCategory.STRAIGHT,
    size: 4
  },
  {
    id: 'line-5',
    name: 'Line (5)',
    shape: [[1, 1, 1, 1, 1]],
    category: PieceCategory.STRAIGHT,
    size: 5
  },
  
  // L-shapes
  {
    id: 'l-small',
    name: 'L-Small',
    shape: [
      [1, 0],
      [1, 1]
    ],
    category: PieceCategory.L_SHAPE,
    size: 3
  },
  {
    id: 'l-medium',
    name: 'L-Medium',
    shape: [
      [1, 1, 1],
      [1, 0, 0]
    ],
    category: PieceCategory.L_SHAPE,
    size: 4
  },
  {
    id: 'l-large',
    name: 'L-Large',
    shape: [
      [1, 1, 1, 1],
      [1, 0, 0, 0]
    ],
    category: PieceCategory.L_SHAPE,
    size: 5
  },
  
  // T-shapes
  {
    id: 't-standard',
    name: 'T-Standard',
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    category: PieceCategory.T_SHAPE,
    size: 4
  },
  {
    id: 't-inverted',
    name: 'T-Inverted',
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    category: PieceCategory.T_SHAPE,
    size: 4
  },
  
  // Z-shapes
  {
    id: 'z-standard',
    name: 'Z-Standard',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    category: PieceCategory.Z_SHAPE,
    size: 4
  },
  {
    id: 'z-inverted',
    name: 'Z-Inverted',
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    category: PieceCategory.Z_SHAPE,
    size: 4
  },
  
  // Square shape
  {
    id: 'square',
    name: 'Square',
    shape: [
      [1, 1],
      [1, 1]
    ],
    category: PieceCategory.SQUARE,
    size: 4
  },
  
  // Complex shapes
  {
    id: 'c-shape',
    name: 'C-Shape',
    shape: [
      [1, 1, 1],
      [1, 0, 1]
    ],
    category: PieceCategory.COMPLEX,
    size: 5
  },
  {
    id: 'plus',
    name: 'Plus',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    category: PieceCategory.COMPLEX,
    size: 5
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    category: PieceCategory.COMPLEX,
    size: 5
  },
  {
    id: 'corner-stairs',
    name: 'Corner Stairs',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ],
    category: PieceCategory.COMPLEX,
    size: 5
  }
];

// Generate piece set for a player
export const generatePlayerPieces = (playerId: number | string): Piece[] => {
  return UNIQUE_PIECE_DEFINITIONS.map((definition, index) => ({
    id: `p${playerId}-${definition.id}`,
    name: definition.name,
    shape: [...definition.shape.map(row => [...row])], // Deep copy shape
    used: false,
    category: definition.category,
    size: definition.size,
    rotation: 0,
    flipped: false
  }));
};

// Count cells in a piece shape
export const countPieceCells = (shape: number[][]): number => {
  return shape.reduce((total, row) => 
    total + row.reduce((rowTotal, cell) => rowTotal + cell, 0), 0);
};

// Create a serializable safe copy of a piece for database storage
export const createSafePieceCopy = (piece: Piece): Piece => {
  return {
    id: piece.id,
    name: piece.name,
    shape: piece.shape.map(row => [...row]), // Deep copy shape
    used: piece.used,
    hidden: piece.hidden,
    category: piece.category,
    size: piece.size,
    rotation: piece.rotation,
    flipped: piece.flipped
  };
};

// Get a unique id for a piece in its current state (for caching validation results)
export const getPieceStateId = (piece: Piece): string => {
  const { id, rotation = 0, flipped = false } = piece;
  return `${id}-r${rotation}-f${flipped ? 1 : 0}`;
};
