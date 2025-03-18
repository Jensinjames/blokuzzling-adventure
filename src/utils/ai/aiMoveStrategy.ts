
import { GameState, Piece, BoardPosition } from '@/types/game';
import { validatePiecePlacement } from '../boardValidation';
import { rotatePiece, flipPiece } from '../pieceManipulation';
import { BOARD_SIZE } from '../gameConstants';
import { AIDifficulty, AIMove } from './aiTypes';
import { getRotationOptions, getFlipOptions } from './difficultyUtils';
import { calculateMoveScore } from './scoreCalculation';
import { chooseMove } from './moveSelection';

// Main function to find the best move for the AI player
export const findAIMove = (
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): { piece: Piece; position: BoardPosition } | null => {
  console.log(`Finding AI move with difficulty: ${difficulty} for player ${aiPlayerIndex}`);
  const aiPlayer = gameState.players[aiPlayerIndex];
  const unusedPieces = aiPlayer.pieces.filter(p => !p.used);
  
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
      // Apply rotations
      let modifiedPiece = { ...piece, shape: [...piece.shape.map(row => [...row])] };
      for (let r = 0; r < rotations; r++) {
        modifiedPiece.shape = rotatePiece(modifiedPiece);
      }
      
      for (const shouldFlip of flipOptions) {
        // Create a copy to avoid mutating the original
        let finalPiece = { 
          ...modifiedPiece, 
          shape: [...modifiedPiece.shape.map(row => [...row])] 
        };
        
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
              gameState.board,
              aiPlayerIndex
            )) {
              // Calculate a score for this move based on difficulty
              const score = calculateMoveScore(
                finalPiece,
                position,
                gameState,
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
  return selectedMove;
};
