
import { GameState, Piece, BoardPosition } from '@/types/game';
import { isWithinBounds } from '../boardValidation';
import { BOARD_SIZE } from '../gameConstants';

// Calculate a score for a potential move
export const calculateMoveScore = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: string
): number => {
  let score = 0;
  
  // Base score: number of cells in the piece (so bigger pieces are preferred)
  const pieceSize = piece.shape.flat().filter(cell => cell === 1).length;
  score += pieceSize * 2; // Increased weight for piece size
  
  // Check if the move would collect a powerup
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        if (isWithinBounds(boardRow, boardCol)) {
          // Collecting powerups is a high priority
          if (gameState.board[boardRow][boardCol].hasPowerup) {
            score += 20; // Increased priority for powerups
          }
          
          // New: Check if move creates a corner-to-corner connection with own pieces
          checkCornerConnections(boardRow, boardCol, gameState, aiPlayerIndex, score, 3);
        }
      }
    }
  }
  
  // For medium and hard difficulties, add strategic considerations
  if (difficulty === 'medium' || difficulty === 'hard') {
    // Prefer moves that control the center of the board
    score += calculateCentralityScore(piece, position);
    
    // For hard difficulty, look ahead to block opponent moves
    if (difficulty === 'hard') {
      score += calculateBlockingScore(piece, position, gameState, aiPlayerIndex);
      score += calculateCornerScore(piece, position);
      score += evaluateAdjacentSpaces(piece, position, gameState, aiPlayerIndex);
    }
  }
  
  return score;
};

// Helper function to check for corner-to-corner connections with own pieces
const checkCornerConnections = (
  row: number,
  col: number,
  gameState: GameState,
  playerIndex: number,
  score: number,
  bonusValue: number
) => {
  const cornerDirections = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  for (const dir of cornerDirections) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && 
        gameState.board[adjRow][adjCol].player === playerIndex) {
      score += bonusValue;
    }
  }
};

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

// New: Calculate score for corner placements (more strategic)
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

// New: Evaluate available spaces after placement
export const evaluateAdjacentSpaces = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number
): number => {
  let adjacentScore = 0;
  
  // Create a simulated board with this piece placed
  const simulatedBoard = JSON.parse(JSON.stringify(gameState.board));
  
  // Place the piece on the simulation
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
  
  // Check all cells after placement to see how many are still valid for player vs opponent
  let playerValidCells = 0;
  let opponentValidCells = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (simulatedBoard[row][col].player === null) {
        // Check if this cell is valid for the AI
        if (isValidForPlayer(row, col, simulatedBoard, aiPlayerIndex)) {
          playerValidCells++;
        }
        
        // Check if this cell is valid for the opponent
        const opponentIndex = aiPlayerIndex === 0 ? 1 : 0;
        if (isValidForPlayer(row, col, simulatedBoard, opponentIndex)) {
          opponentValidCells++;
        }
      }
    }
  }
  
  // Prefer moves that maximize AI's valid cells and minimize opponent's valid cells
  adjacentScore = playerValidCells - opponentValidCells;
  
  return adjacentScore;
};

// Helper to check if a cell is valid for a given player (simplified)
const isValidForPlayer = (
  row: number,
  col: number,
  board: any[][],
  playerIndex: number
): boolean => {
  // Check if cell is already occupied
  if (board[row][col].player !== null) {
    return false;
  }
  
  // Check adjacent orthogonal cells (if any are this player's, it's not valid)
  const orthogonalDirs = [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ];
  
  for (const dir of orthogonalDirs) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && board[adjRow][adjCol].player === playerIndex) {
      return false;
    }
  }
  
  // Check diagonal cells (at least one should be this player's)
  const diagonalDirs = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  for (const dir of diagonalDirs) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && board[adjRow][adjCol].player === playerIndex) {
      return true;
    }
  }
  
  return false;
};
