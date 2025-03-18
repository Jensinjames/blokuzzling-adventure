
import { useState } from 'react';
import { toast } from 'sonner';

export const useMultiplayerPowerups = (isMyTurn: boolean) => {
  const [isPowerupActive, setIsPowerupActive] = useState<boolean>(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);

  const handlePlayerUsePowerup = (playerId: number, gameCurrentPlayer: number, powerupType: string) => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    
    if (playerId !== gameCurrentPlayer) {
      toast.error("You can only use your own powerups during your turn");
      return;
    }
    
    if (isPowerupActive) {
      setIsPowerupActive(false);
      setActivePowerupType(null);
      toast.info("Powerup mode cancelled");
    } else {
      setIsPowerupActive(true);
      setActivePowerupType(powerupType);
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
};
