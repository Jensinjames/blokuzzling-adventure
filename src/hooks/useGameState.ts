
import { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import { useGameInitialization } from './useGameInitialization';
import { useGameCompletion } from './useGameCompletion';
import { usePieceState } from './game/usePieceState';

export function useGameState(numPlayers: number = 2) {
  const { initGame } = useGameInitialization(numPlayers);
  const [gameState, setGameState] = useState<GameState>(initGame());
  const {
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement
  } = usePieceState();

  // Initialize game
  useEffect(() => {
    const initialGameState = initGame();
    setGameState(initialGameState);
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  }, [initGame]);

  // Check for game completion
  useGameCompletion(gameState, setGameState);

  // Reset game function
  const resetGame = () => {
    const initialGameState = initGame();
    setGameState(initialGameState);
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  return {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame: resetGame
  };
}
