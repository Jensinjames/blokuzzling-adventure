
import { useState } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionCreate() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  // Create a new game session
  const createGameSession = async (maxPlayers: number = 2) => {
    if (!user) {
      toast.error('You must be logged in to create a game');
      return null;
    }

    setCreating(true);
    try {
      console.log('Creating game session with max players:', maxPlayers);
      
      // Create game session with minimal initial data
      const gameSessionData = {
        creator_id: user.id,
        max_players: maxPlayers,
        current_players: 1,
        status: 'waiting',
        ai_enabled: false,
        ai_count: 0,
        ai_difficulty: 'medium'
      };
      
      // Create game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert(gameSessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Failed to create game session");

      const typedSessionData = safeSingleDataCast<GameSession>(sessionData);
      console.log('Game session created:', typedSessionData.id);

      // Add creator as first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: typedSessionData.id,
          player_id: user.id,
          player_number: 0 // First player is always 0
        });

      if (playerError) throw playerError;

      toast.success('Game created successfully!');
      return typedSessionData.id;
    } catch (error: any) {
      console.error('Failed to create game:', error);
      toast.error(`Failed to create game: ${error.message}`);
      return null;
    } finally {
      setCreating(false);
    }
  };

  return {
    createGameSession,
    creating
  };
}
