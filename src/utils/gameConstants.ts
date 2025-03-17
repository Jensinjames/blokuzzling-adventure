
import { BoardPosition } from '@/types/game';

export const BOARD_SIZE = 14;

export const PIECE_SHAPES = [
  // 1x1
  [[1]],
  
  // 2x1
  [[1, 1]],
  
  // 3x1
  [[1, 1, 1]],
  
  // 4x1
  [[1, 1, 1, 1]],
  
  // 5x1
  [[1, 1, 1, 1, 1]],
  
  // L shapes
  [
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0]
  ],
  
  // T shapes
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  
  // Z shapes
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  
  // Square shapes
  [
    [1, 1],
    [1, 1]
  ],
  
  // More complex shapes
  [
    [1, 1, 1],
    [1, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1]
  ]
];

// Modified starting corners to ensure players start at opposite corners
export const startingCorners: BoardPosition[] = [
  { row: 0, col: 0 },                    // Player 0: top-left
  { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 }, // Player 1: bottom-right
  { row: BOARD_SIZE - 1, col: 0 },             // Player 2: bottom-left
  { row: 0, col: BOARD_SIZE - 1 },             // Player 3: top-right
];

// Define powerup corners specifically for 2-player single-player games
export const powerupCorners: BoardPosition[] = [
  { row: 0, col: BOARD_SIZE - 1 },       // Top-right corner
  { row: BOARD_SIZE - 1, col: 0 },       // Bottom-left corner
];
