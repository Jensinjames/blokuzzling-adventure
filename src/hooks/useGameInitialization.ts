
import { useCallback } from 'react';
import { GameState } from '@/types/game';
import { createInitialGameState } from '@/utils/gameUtils';

export function useGameInitialization(numPlayers: number = 2) {
  const initGame = useCallback(() => {
    const initialGameState = createInitialGameState(numPlayers);
    
    if (numPlayers === 2) {
      initialGameState.currentPlayer = 0; // First player starts
    }
    
    return initialGameState;
  }, [numPlayers]);

  return { initGame };
}
