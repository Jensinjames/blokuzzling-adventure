
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

      // Update game session status
      const updatedGameState = {
        ...gameState,
        gameStatus: 'finished',
        winner: winnerId
      };

      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: winnerProfileId,
          game_state: updatedGameState as any
        })
        .eq('id', gameId);

      // Update player stats
      if (winnerId !== null) {
        for (const player of players) {
          if (player.player_number === winnerId) {
            // Winner
            await supabase
              .from('profiles')
              .update({
                wins: player.profile.wins + 1
              })
              .eq('id', player.player_id);
          } else {
            // Loser
            await supabase
              .from('profiles')
              .update({
                losses: player.profile.losses + 1
              })
              .eq('id', player.player_id);
          }
        }
      } else {
        // Draw
        for (const player of players) {
          await supabase
            .from('profiles')
            .update({
              draws: player.profile.draws + 1
            })
            .eq('id', player.player_id);
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
