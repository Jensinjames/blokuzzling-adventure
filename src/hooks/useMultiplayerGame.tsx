
import { useGameData } from './useGameData';
import { useGameStateManager } from './useGameStateManager';
import { useGameCompletion } from './useGameCompletion';
import { BoardPosition, Piece } from '@/types/game';

export function useMultiplayerGame(gameId: string) {
  const {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber
  } = useGameData(gameId);

  const {
    isMyTurn,
    updateGameState,
    makeMove
  } = useGameStateManager(gameId, gameState, playerNumber);

  const {
    endGame
  } = useGameCompletion(gameId, players);

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState,
    makeMove,
    endGame: (winnerId: number | null) => endGame(gameState, winnerId)
  };
}
