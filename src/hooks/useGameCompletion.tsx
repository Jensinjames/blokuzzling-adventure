
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameState } from '@/types/game';
import { GamePlayer, Profile } from '@/types/database';
import { toast } from 'sonner';

export function useGameCompletion(
  gameId: string,
  players: (GamePlayer & { profile: Profile })[]
) {
  const { user } = useAuth();

  // End the game
  const endGame = async (gameState: GameState | null, winnerId: number | null) => {
    if (!user || !gameId || !gameState) {
      return false;
    }

    try {
      // Get winner profile ID
      let winnerProfileId = null;
      if (winnerId !== null) {
        const winnerPlayer = players.find(p => p.player_number === winnerId);
        if (winnerPlayer) {
          winnerProfileId = winnerPlayer.player_id;
        }
      }

      // Update game state
      const updatedGameState = {
        ...gameState,
        gameStatus: 'finished',
        winner: winnerId
      };

      // Convert to JSON-safe format
      const jsonSafeGameState = JSON.parse(JSON.stringify(updatedGameState));

      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: winnerProfileId,
          game_state: jsonSafeGameState
        })
        .eq('id', gameId);

      // Update player stats
      if (winnerId !== null) {
        for (const player of players) {
          if (player.player_number === winnerId) {
            // Winner - Get current stats first
            const { data: winnerData } = await supabase
              .from('profiles')
              .select('wins')
              .eq('id', player.player_id)
              .single();
              
            if (winnerData) {
              // Update with incremented wins
              await supabase
                .from('profiles')
                .update({
                  wins: (winnerData.wins || 0) + 1
                })
                .eq('id', player.player_id);
            }
          } else {
            // Loser - Get current stats first
            const { data: loserData } = await supabase
              .from('profiles')
              .select('losses')
              .eq('id', player.player_id)
              .single();
              
            if (loserData) {
              // Update with incremented losses
              await supabase
                .from('profiles')
                .update({
                  losses: (loserData.losses || 0) + 1
                })
                .eq('id', player.player_id);
            }
          }
        }
      } else {
        // Draw - update all players
        for (const player of players) {
          const { data: playerData } = await supabase
            .from('profiles')
            .select('draws')
            .eq('id', player.player_id)
            .single();
            
          if (playerData) {
            await supabase
              .from('profiles')
              .update({
                draws: (playerData.draws || 0) + 1
              })
              .eq('id', player.player_id);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Failed to end game');
      return false;
    }
  };

  return {
    endGame
  };
}
