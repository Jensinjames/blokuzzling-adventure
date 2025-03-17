
import { GameState } from '@/types/game';
import { isWithinBounds } from '../boardValidation';
import { BOARD_SIZE } from '../gameConstants';

// Calculate a score for a potential move
export const calculateMoveScore = (
  piece: any,
  position: { row: number; col: number },
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: string
): number => {
  let score = 0;
  
  // Base score: number of cells in the piece (so bigger pieces are preferred)
  const pieceSize = piece.shape.flat().filter(cell => cell === 1).length;
  score += pieceSize;
  
  // Check if the move would collect a powerup
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        if (isWithinBounds(boardRow, boardCol) && 
            gameState.board[boardRow][boardCol].hasPowerup) {
          // Collecting powerups is good
          score += 10;
        }
      }
    }
  }
  
  // For medium and hard difficulties, add strategic considerations
  if (difficulty === 'medium' || difficulty === 'hard') {
    // Prefer moves that block the center of the board
    score += calculateCentralityScore(piece, position);
    
    // For hard difficulty, look ahead to block opponent moves
    if (difficulty === 'hard') {
      score += calculateBlockingScore(piece, position, gameState, aiPlayerIndex);
    }
  }
  
  return score;
};

// Calculate how central the placement is (center placements are better strategically)
export const calculateCentralityScore = (
  piece: any, 
  position: { row: number; col: number }
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
  return Math.max(0, 5 - averageDistance); // Bonus of 0-5 based on centrality
};

// Calculate how effectively this move blocks opponent moves
export const calculateBlockingScore = (
  piece: any,
  position: { row: number; col: number },
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
            blockingScore += 2;
          }
        }
      }
    }
  }
  
  return blockingScore;
};
