
import { useState } from 'react';
import { supabase, safeSingleDataCast, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionJoin() {
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);

  // Join a game session
  const joinGameSession = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a game');
      return false;
    }

    setJoining(true);
    try {
      // Check if player is already in the game
      const { data: existingPlayer, error: playerError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', user.id);

      if (playerError) throw playerError;

      if (existingPlayer && existingPlayer.length > 0) {
        toast.info('You are already in this game');
        return true;
      }

      // Get current game session info
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (sessionError || !sessionData) throw sessionError || new Error("Game not found");

      const typedSessionData = safeSingleDataCast<GameSession>(sessionData);

      // Check if game is full
      if (typedSessionData.current_players >= typedSessionData.max_players) {
        toast.error('This game is full');
        return false;
      }

      // Check if game is already started
      if (typedSessionData.status !== 'waiting') {
        toast.error('This game has already started');
        return false;
      }

      // Get next player number
      const { data: playersData, error: listError } = await supabase
        .from('game_players')
        .select('player_number')
        .eq('game_id', gameId)
        .order('player_number', { ascending: false });

      if (listError) throw listError;

      const typedPlayersData = safeDataCast<{ player_number: number }>(playersData);
      const nextPlayerNumber = (typedPlayersData && typedPlayersData.length > 0) 
        ? (typedPlayersData[0].player_number + 1) 
        : 0;

      // Add player to game
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameId,
          player_id: user.id,
          player_number: nextPlayerNumber
        });

      if (joinError) throw joinError;

      // Update game session player count
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          current_players: typedSessionData.current_players + 1
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Joined game successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to join game: ${error.message}`);
      return false;
    } finally {
      setJoining(false);
    }
  };

  return {
    joinGameSession,
    joining
  };
}
