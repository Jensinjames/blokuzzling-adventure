
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { GameState } from '@/types/game';
import { toast } from 'sonner';

export function useGameStateUpdater(
  gameId: string,
  playerNumber: number | null
) {
  const { user } = useAuth();

  // Update game state
  const updateGameState = async (newState: GameState, gameState: GameState | null) => {
    if (!user || !gameId || playerNumber === null) {
      return false;
    }

    try {
      // Convert complex objects to JSON-compatible format
      const jsonSafeGameState = JSON.parse(JSON.stringify(newState));
      
      // Add to turn history
      const newHistoryItem = {
        player: playerNumber,
        timestamp: Date.now(),
        action: 'move'
      };
      
      const jsonSafeTurnHistory = JSON.parse(
        JSON.stringify([...(gameState?.turnHistory || []), newHistoryItem])
      );

      // Update the game session with the new state
      const { error } = await supabase
        .from('game_sessions')
        .update({
          game_state: jsonSafeGameState,
          turn_history: jsonSafeTurnHistory
        } as any) // Type assertion to bypass strict checking
        .eq('id', gameId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
      return false;
    }
  };

  return { updateGameState };
}
