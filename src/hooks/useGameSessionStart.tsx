
import { useState } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';
import { createInitialGameState } from '@/utils/gameUtils';
import { AIDifficulty } from '@/utils/ai/aiTypes';

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

      // Fetch joined human players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('game_id', gameId)
        .order('player_number', { ascending: true });

      if (playersError) throw playersError;
      
      const humanPlayers = playersData || [];
      
      // Check if we need to add AI players
      let totalPlayers = humanPlayers.length;
      const aiEnabled = typedSessionData.ai_enabled || false;
      const aiCount = typedSessionData.ai_count || 0;
      const aiDifficulty = (typedSessionData.ai_difficulty as AIDifficulty) || 'medium';
      
      console.log('Starting game with:', {
        humanPlayers: totalPlayers,
        aiEnabled,
        aiCount,
        aiDifficulty
      });
      
      if (aiEnabled && aiCount > 0) {
        totalPlayers += aiCount;
      } else if (totalPlayers < 2) {
        toast.error('At least 2 players are required to start the game');
        return false;
      }
      
      // Create initial game state with appropriate number of players
      const initialGameState = createInitialGameState(totalPlayers);
      
      // Mark AI players in the game state
      if (aiEnabled && aiCount > 0) {
        // Human players have index 0 to humanPlayers.length-1
        // AI players have index humanPlayers.length to totalPlayers-1
        for (let i = humanPlayers.length; i < totalPlayers; i++) {
          initialGameState.players[i].isAI = true;
          initialGameState.players[i].aiDifficulty = aiDifficulty;
          initialGameState.players[i].name = `AI Player ${i - humanPlayers.length + 1}`;
        }
      }

      // Update game status and set initial state
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          status: 'active',
          game_state: initialGameState
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Game started!');
      return true;
    } catch (error: any) {
      console.error('Failed to start game:', error);
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
