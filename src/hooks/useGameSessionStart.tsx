
import { useState } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionStart() {
  const { user } = useAuth();
  const [starting, setStarting] = useState(false);

  // Start a game session
  const startGameSession = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to start a game');
      return false;
    }

    setStarting(true);
    try {
      // Check if user is the creator
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (sessionError || !sessionData) throw sessionError || new Error("Game not found");

      const typedSessionData = safeSingleDataCast<GameSession>(sessionData);
      
      if (typedSessionData.creator_id !== user.id) {
        toast.error('Only the game creator can start the game');
        return false;
      }

      // Update game status
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          status: 'playing'
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Game started!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to start game: ${error.message}`);
      return false;
    } finally {
      setStarting(false);
    }
  };

  return {
    startGameSession,
    starting
  };
}
