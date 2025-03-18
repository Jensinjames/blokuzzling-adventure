
import { GameState, Piece, BoardPosition } from '@/types/game';
import { isWithinBounds } from '@/utils/boardValidation';
import { calculateCentralityScore } from './centralityScore';
import { calculateBlockingScore } from './blockingScore';
import { calculateCornerScore } from './cornerScore';
import { evaluateAdjacentSpaces } from './adjacentSpacesScore';
import { checkCornerConnections } from './scoreUtils';

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
          
          // Check if move creates a corner-to-corner connection with own pieces
          score = checkCornerConnections(boardRow, boardCol, gameState, aiPlayerIndex, score, 3);
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
