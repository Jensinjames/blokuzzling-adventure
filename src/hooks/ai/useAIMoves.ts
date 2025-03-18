
import { GameState, Piece, BoardPosition } from '@/types/game';
import { placeSelectedPiece } from '@/utils/boardUtils';
import { findAIMove } from '@/utils/aiPlayerUtils';
import { AIDifficulty } from '@/utils/ai/aiTypes';

// Helper function to make an AI move
export const makeAIMove = (
  gameState: GameState,
  piece: Piece,
  position: BoardPosition,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  console.log('AI making move:', { 
    pieceId: piece.id,
    position: `(${position.row},${position.col})` 
  });
  
  // Place the selected piece
  const { updatedGameState } = placeSelectedPiece(
    gameState,
    piece,
    position
  );
  
  // Update the game state
  setGameState(updatedGameState);
  
  return updatedGameState;
};

export function useAIMoves() {
  const findAndMakeMove = (
    gameState: GameState,
    aiPlayerIndex: number,
    difficulty: AIDifficulty,
    setGameState: (state: GameState) => void
  ): boolean => {
    try {
      // Find the best move according to the AI's difficulty level
      console.log(`Finding AI move for player ${aiPlayerIndex} with difficulty ${difficulty}`);
      const aiMove = findAIMove(gameState, aiPlayerIndex, difficulty);
      
      if (!aiMove) {
        console.log('No valid AI move found');
        // No valid move was found
        return false;
      } else {
        console.log('AI move found:', {
          pieceId: aiMove.piece.id,
          position: `(${aiMove.position.row},${aiMove.position.col})`
        });
        
        // Make the selected move
        const updatedState = makeAIMove(gameState, aiMove.piece, aiMove.position, 
          state => {
            if (typeof state === 'function') {
              setGameState(state(gameState));
            } else {
              setGameState(state);
            }
          }
        );
        
        // Ensure the state is updated
        setGameState(updatedState);
        return true;
      }
    } catch (error) {
      console.error('Error in AI move finding:', error);
      return false;
    }
  };

  return { findAndMakeMove };
}
