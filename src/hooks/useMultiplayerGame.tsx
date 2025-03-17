
import { useGameData } from './useGameData';
import { useGameStateManager } from './useGameStateManager';
import { useGameCompletion } from './useGameCompletion';
import { BoardPosition, Piece, GameState } from '@/types/game';

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

  // Use useGameCompletion with the correct parameters
  useGameCompletion(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    setGameState
  );

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState,
    makeMove
  };
}
