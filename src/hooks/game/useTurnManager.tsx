
import { useState, useEffect } from 'react';
import { GameState } from '@/types/game';

export function useTurnManager(
  gameState: GameState | null,
  playerNumber: number | null
) {
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Check if it's the current player's turn
  useEffect(() => {
    if (gameState && playerNumber !== null) {
      setIsMyTurn(gameState.currentPlayer === playerNumber);
    }
  }, [gameState, playerNumber]);

  return { isMyTurn };
}
