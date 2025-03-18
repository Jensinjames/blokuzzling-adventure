
import React from 'react';
import { GameState } from '@/types/game';
import PlayerInfo from '@/components/PlayerInfo';

interface PlayerInfoWrapperProps {
  gameState: GameState;
  playerNumber: number | null;
  isMyTurn: boolean;
  onUsePowerup?: (playerId: number, powerupType: string) => void;
}

const PlayerInfoWrapper: React.FC<PlayerInfoWrapperProps> = ({
  gameState,
  playerNumber,
  isMyTurn,
  onUsePowerup
}) => {
  return (
    <PlayerInfo
      players={gameState.players}
      currentPlayer={gameState.currentPlayer}
      onUsePowerup={onUsePowerup}
      isViewerCurrentPlayer={isMyTurn}
    />
  );
};

export default PlayerInfoWrapper;
