
import { useState } from 'react';
import { Player, Piece, BoardPosition, GameState } from '@/types/game';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { useGameState } from '@/hooks/useGameState';

export function useGameInitialization(numPlayers: number = 2) {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [lastPassPlayer, setLastPassPlayer] = useState<number | null>(null);
  
  const {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame
  } = useGameState(numPlayers);

  // Start the game with the selected settings
  const handleStartGame = () => {
    // Reset the game with current settings
    initGame();
    setGameStarted(true);
    setLastPassPlayer(null);
  };

  // Handle AI difficulty selection
  const handleSelectDifficulty = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
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
    initGame,
    gameStarted,
    setGameStarted,
    aiDifficulty,
    setAiDifficulty,
    lastPassPlayer,
    setLastPassPlayer,
    handleStartGame,
    handleSelectDifficulty
  };
}
