
import { GameState, Piece, BoardPosition } from '@/types/game';
import { validatePiecePlacement } from '../boardValidation';
import { rotatePiece, flipPiece } from '../pieceManipulation';
import { BOARD_SIZE } from '../gameConstants';
import { AIDifficulty, AIMove } from './aiTypes';
import { getRotationOptions, getFlipOptions } from './difficultyUtils';
import { calculateMoveScore } from './score';
import { chooseMove } from './moveSelection';

// Main function to find the best move for the AI player
export const findAIMove = (
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): { piece: Piece; position: BoardPosition } | null => {
  console.log(`Finding AI move with difficulty: ${difficulty} for player ${aiPlayerIndex}`);
  
  // Use a clean copy to avoid circular references - use JSON serialization
  const safeGameState = JSON.parse(JSON.stringify(gameState));
  const aiPlayer = safeGameState.players[aiPlayerIndex];
  const unusedPieces = aiPlayer.pieces.filter((p: Piece) => !p.used);
  
  if (unusedPieces.length === 0) {
    console.log("AI has no unused pieces left");
    return null;
  }
  
  // Get all possible moves
  const possibleMoves: AIMove[] = [];
  
  // For each piece, find all valid placements
  for (const piece of unusedPieces) {
    // Try different rotations and flips based on difficulty
    const rotationOptions = getRotationOptions(difficulty);
    const flipOptions = getFlipOptions(difficulty);
    
    for (const rotations of rotationOptions) {
      // Apply rotations - create a new copy for each rotation to prevent mutation
      let modifiedPiece = JSON.parse(JSON.stringify(piece));
      for (let r = 0; r < rotations; r++) {
        modifiedPiece.shape = rotatePiece(modifiedPiece);
      }
      
      for (const shouldFlip of flipOptions) {
        // Create a fresh copy to avoid modifying the rotated piece
        let finalPiece = JSON.parse(JSON.stringify(modifiedPiece));
        
        // Apply flip if needed
        if (shouldFlip) {
          finalPiece.shape = flipPiece(finalPiece);
        }
        
        // Check all possible positions on the board
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            const position: BoardPosition = { row, col };
            
            if (validatePiecePlacement(
              finalPiece,
              position,
              safeGameState.board,
              aiPlayerIndex
            )) {
              // Calculate a score for this move based on difficulty
              const score = calculateMoveScore(
                finalPiece,
                position,
                safeGameState,
                aiPlayerIndex,
                difficulty
              );
              
              possibleMoves.push({
                piece: {
                  ...finalPiece,
                  id: piece.id,
                  name: piece.name,
                  used: piece.used
                },
                position,
                score
              });
            }
          }
        }
      }
    }
  }
  
  if (possibleMoves.length === 0) {
    console.log("AI found no valid moves");
    return null;
  }
  
  console.log(`AI found ${possibleMoves.length} possible moves`);
  // Choose the move based on difficulty
  const selectedMove = chooseMove(possibleMoves, difficulty);
  console.log(`AI selected move with piece ${selectedMove.piece.id} at position (${selectedMove.position.row}, ${selectedMove.position.col}), score: ${selectedMove.score}`);
  
  return {
    piece: selectedMove.piece,
    position: selectedMove.position
  };
};
