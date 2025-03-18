
import { Piece, BoardPosition, GameState } from '@/types/game';
import { isWithinBounds } from '@/utils/boardValidation';
import { isValidForPlayer } from './validationUtils';

// Evaluate available spaces after placement
export const evaluateAdjacentSpaces = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number
): number => {
  let adjacentScore = 0;
  
  // Create a simpler simulated board with this piece placed
  // Use a flat structure to avoid deep nesting
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
