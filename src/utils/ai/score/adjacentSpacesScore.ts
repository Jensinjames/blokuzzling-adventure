
import { Piece, BoardPosition, GameState } from '@/types/game';
import { isWithinBounds } from '@/utils/boardValidation';

// Evaluate available spaces after placement
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
  
  for (let row = 0; row < gameState.board.length; row++) {
    for (let col = 0; col < gameState.board[row].length; col++) {
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
export const isValidForPlayer = (
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
