
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessions() {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game sessions
  useEffect(() => {
    if (!user) return;

    const fetchGameSessions = async () => {
      try {
        // Fetch active sessions
        const { data: activeSessionsData, error: activeError } = await supabase
          .from('game_sessions')
          .select('*')
          .ilike('status', 'waiting')
          .order('created_at', { ascending: false });

        if (activeError) throw activeError;

        // Fetch user's sessions
        const { data: userSessionsData, error: userError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        setActiveSessions((activeSessionsData || []) as GameSession[]);
        setUserSessions((userSessionsData || []) as GameSession[]);
      } catch (error) {
        console.error('Error fetching game sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameSessions();

    // Subscribe to game sessions
    const sessionsChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          if (payload.new && 'id' in payload.new) {
            // Refresh sessions when there's a change
            fetchGameSessions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
    };
  }, [user]);

  // Create a new game session
  const createGameSession = async (maxPlayers: number = 2) => {
    if (!user) {
      toast.error('You must be logged in to create a game');
      return null;
    }

    try {
      // Create game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([{
          creator_id: user.id,
          max_players: maxPlayers,
          current_players: 1,
          status: 'waiting'
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Failed to create game session");

      // Add creator as first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert([{
          game_id: sessionData.id,
          player_id: user.id,
          player_number: 0 // First player is always 0
        }]);

      if (playerError) throw playerError;

      toast.success('Game created successfully!');
      return sessionData.id;
    } catch (error: any) {
      toast.error(`Failed to create game: ${error.message}`);
      return null;
    }
  };

  // Join a game session
  const joinGameSession = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a game');
      return false;
    }

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

      // Check if game is full
      if (sessionData.current_players >= sessionData.max_players) {
        toast.error('This game is full');
        return false;
      }

      // Check if game is already started
      if (sessionData.status !== 'waiting') {
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

      const nextPlayerNumber = (playersData && playersData.length > 0) 
        ? (playersData[0].player_number + 1) 
        : 0;

      // Add player to game
      const { error: joinError } = await supabase
        .from('game_players')
        .insert([{
          game_id: gameId,
          player_id: user.id,
          player_number: nextPlayerNumber
        }]);

      if (joinError) throw joinError;

      // Update game session player count
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          current_players: sessionData.current_players + 1
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Joined game successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to join game: ${error.message}`);
      return false;
    }
  };

  // Start a game session
  const startGameSession = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to start a game');
      return false;
    }

    try {
      // Check if user is the creator
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (sessionError || !sessionData) throw sessionError || new Error("Game not found");

      if (sessionData.creator_id !== user.id) {
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
    }
  };

  return {
    activeSessions,
    userSessions,
    loading,
    createGameSession,
    joinGameSession,
    startGameSession
  };
}
