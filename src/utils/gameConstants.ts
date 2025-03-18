
import { BoardPosition } from '@/types/game';

export const BOARD_SIZE = 14;

// Define common piece types (these are now historical, we use pieceUtils.ts for the actual definitions)
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

// Constants for validation caching
export const VALIDATION_CACHE_SIZE = 1000; // Maximum size of the validation cache
export const MAX_BOARD_EVALUATION_TIME = 300; // Maximum time in ms for board evaluation

// Constants for database synchronization
export const MIN_UPDATE_INTERVAL = 200; // Minimum time between updates in ms
export const VERSION_CHECK_INTERVAL = 5000; // Time between version checks in ms
