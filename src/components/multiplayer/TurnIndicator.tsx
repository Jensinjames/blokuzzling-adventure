
import React from 'react';
import { GameState } from '@/types/game';

interface TurnIndicatorProps {
  gameState: GameState;
  isMyTurn: boolean;
  isPowerupActive: boolean;
  activePowerupType: string | null;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  gameState,
  isMyTurn,
  isPowerupActive,
  activePowerupType
}) => {
  return (
    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
      {isMyTurn 
        ? (isPowerupActive 
            ? `Select a block to use ${activePowerupType} powerup` 
            : "Your turn - Select a piece from your inventory")
        : `Waiting for ${gameState.players[gameState.currentPlayer]?.name || 'opponent'} to make a move...`}
    </div>
  );
};

export default TurnIndicator;
