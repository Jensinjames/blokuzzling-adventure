
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
  // Place the selected piece
  const { updatedGameState } = placeSelectedPiece(
    gameState,
    piece,
    position
  );
  
  // Update the game state
  setGameState(updatedGameState);
};

export function useAIMoves() {
  const findAndMakeMove = (
    gameState: GameState,
    aiPlayerIndex: number,
    difficulty: AIDifficulty,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
  ): boolean => {
    // Find the best move according to the AI's difficulty level
    const aiMove = findAIMove(gameState, aiPlayerIndex, difficulty);
    
    if (!aiMove) {
      // No valid move was found
      return false;
    } else {
      // Make the selected move
      makeAIMove(gameState, aiMove.piece, aiMove.position, setGameState);
      return true;
    }
  };

  return { findAndMakeMove };
}
