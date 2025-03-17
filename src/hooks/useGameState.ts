
import { useState, useEffect } from 'react';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { useGameInitialization } from './useGameInitialization';
import { useGameCompletion } from './useGameCompletion';

export function useGameState(numPlayers: number = 2) {
  const { initGame } = useGameInitialization(numPlayers);
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);

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
