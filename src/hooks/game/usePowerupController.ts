
import { useState } from 'react';
import { GameState, Player } from '@/types/game';
import { toast } from 'sonner';

export function usePowerupController() {
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);

  // Handler for using powerup from player info card
  const handlePlayerUsePowerup = (
    gameState: GameState,
    playerId: number, 
    powerupType: string
  ) => {
    if (playerId !== gameState.currentPlayer) {
      toast.error("You can only use your own powerups during your turn");
      return;
    }
    
    if (isPowerupActive) {
      setIsPowerupActive(false);
      setActivePowerupType(null);
      toast.info("Powerup mode cancelled");
    } else {
      setActivePowerupType(powerupType);
      setIsPowerupActive(true);
      toast.info(`Select a block to use ${powerupType} powerup`);
    }
  };

  const cancelPowerupMode = () => {
    setIsPowerupActive(false);
    setActivePowerupType(null);
    toast.info("Powerup mode cancelled");
  };

  return {
    isPowerupActive,
    setIsPowerupActive,
    activePowerupType,
    setActivePowerupType,
    handlePlayerUsePowerup,
    cancelPowerupMode
  };
}
