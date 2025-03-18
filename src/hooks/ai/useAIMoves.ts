
import { useState } from 'react';
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
  
  // Create a copy of the game state to avoid mutation
  const gameStateCopy = JSON.parse(JSON.stringify(gameState));
  
  // Place the selected piece
  const { updatedGameState } = placeSelectedPiece(
    gameStateCopy,
    piece,
    position
  );
  
  // Update the game state
  setGameState(updatedGameState);
  
  return updatedGameState;
};

export function useAIMoves() {
  const [processing, setProcessing] = useState(false);

  const findAndMakeMove = (
    gameState: GameState,
    aiPlayerIndex: number,
    difficulty: AIDifficulty,
    setGameState: (state: GameState) => void
  ): boolean => {
    // Prevent recursive or multiple simultaneous AI moves
    if (processing) {
      console.log('Already processing an AI move, skipping');
      return false;
    }
    
    try {
      setProcessing(true);
      
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
        
        // Create a deep copy of the game state to avoid mutation issues
        const gameStateCopy = JSON.parse(JSON.stringify(gameState));
        
        // Make the selected move
        const updatedState = makeAIMove(
          gameStateCopy, 
          aiMove.piece, 
          aiMove.position,
          (newState) => {
            // Ensure we're updating with the latest state
            if (typeof newState === 'function') {
              const calculatedState = newState(gameStateCopy);
              setGameState(calculatedState);
              return calculatedState;
            } else {
              setGameState(newState);
              return newState;
            }
          }
        );
        
        return true;
      }
    } catch (error) {
      console.error('Error in AI move finding:', error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return { findAndMakeMove, processing };
}
