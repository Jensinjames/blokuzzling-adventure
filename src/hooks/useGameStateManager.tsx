
import { useTurnManager } from '@/hooks/game/useTurnManager';
import { useGameStateUpdater } from '@/hooks/game/useGameStateUpdater';
import { useMoveActions } from '@/hooks/game/useMoveActions';
import { GameState } from '@/types/game';

export function useGameStateManager(
  gameId: string,
  gameState: GameState | null,
  playerNumber: number | null,
  gameSessionId?: string
) {
  // Get turn status
  const { isMyTurn } = useTurnManager(gameState, playerNumber);
  
  // Get state update function
  const { updateGameState } = useGameStateUpdater(gameId, playerNumber);
  
  // Get move action functions
  const { makeMove } = useMoveActions(
    gameId, 
    gameState, 
    playerNumber, 
    isMyTurn, 
    (newState: GameState) => updateGameState(newState, gameState)
  );

  return {
    isMyTurn,
    updateGameState: (newState: GameState) => updateGameState(newState, gameState),
    makeMove
  };
}
