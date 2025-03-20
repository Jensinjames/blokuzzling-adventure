
import { useState } from 'react';
import { GameSession } from '@/types/database';

export function useGameManagement(initialGames: GameSession[] = []) {
  const [games, setGames] = useState<GameSession[]>(initialGames);
  
  // Update games when fetched games change
  const updateGames = (fetchedGames: GameSession[] | undefined) => {
    if (fetchedGames) {
      setGames(fetchedGames);
    }
  };
  
  // Handle game deletion
  const handleGameDeleted = (gameId: string) => {
    setGames(prevGames => prevGames.filter(game => game.id !== gameId));
  };
  
  return {
    games,
    updateGames,
    handleGameDeleted
  };
}
