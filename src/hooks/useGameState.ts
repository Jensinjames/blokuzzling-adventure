import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Piece, BoardPosition, GameState } from '@/types/game';
import {
  createInitialGameState,
  checkGameOver,
  calculateScore,
  determineWinner,
  hasValidMoves,
} from '@/utils/gameUtils';

export function useGameState(numPlayers: number = 2) {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(numPlayers));
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);

  const initGame = useCallback(() => {
    const initialGameState = createInitialGameState(numPlayers);
    
    if (numPlayers === 2) {
      initialGameState.currentPlayer = 0; // First player starts
    }
    
    setGameState(initialGameState);
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  }, [numPlayers]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && checkGameOver(gameState)) {
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: calculateScore(player.pieces)
      }));
      
      const winner = determineWinner(updatedPlayers);
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner
      }));
      
      toast(`Game Over! ${winner !== null ? `Player ${winner + 1} wins!` : 'It\'s a tie!'}`);
    }
  }, [gameState]);

  return {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame
  };
}
