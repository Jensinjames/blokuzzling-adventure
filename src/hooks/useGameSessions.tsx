
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useGameSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game sessions
  const fetchGameSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all waiting/active sessions
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false });

      // Fetch sessions where user is a player
      const { data: playerData } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('player_id', user.id);

      if (playerData && playerData.length > 0) {
        const gameIds = playerData.map(p => p.game_id);
        
        const { data: userSessionData } = await supabase
          .from('game_sessions')
          .select('*')
          .in('id', gameIds)
          .order('updated_at', { ascending: false });
          
        setUserSessions(userSessionData as GameSession[] || []);
      }

      setActiveSessions(sessionData as GameSession[] || []);
    } catch (error) {
      console.error('Error fetching game sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to game sessions
  useEffect(() => {
    if (!user) return;

    fetchGameSessions();

    // Subscribe to game sessions
    const sessionChannel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          // If one of user's sessions - check if payload.new exists and has an id before using it
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new && 
              userSessions.some(s => s.id === payload.new.id)) {
            fetchGameSessions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [user]);

  // Create a new game session
  const createGameSession = async (maxPlayers: number) => {
    if (!user) {
      toast.error('You must be logged in to create a game');
      return null;
    }

    try {
      // Create the game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          creator_id: user.id,
          status: 'waiting',
          max_players: maxPlayers,
          current_players: 1
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add the creator as player 0
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: sessionData.id,
          player_id: user.id,
          player_number: 0
        });

      if (playerError) throw playerError;

      toast.success('Game session created successfully');
      navigate(`/lobby/${sessionData.id}`);
      return sessionData;
    } catch (error: any) {
      toast.error(`Failed to create game: ${error.message}`);
      return null;
    }
  };

  // Join an existing game session
  const joinGameSession = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a game');
      return false;
    }

    try {
      // Check if session exists and has space
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, game_players(*)')
        .eq('id', gameId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData.status !== 'waiting') {
        toast.error('This game is no longer accepting players');
        return false;
      }

      if (sessionData.current_players >= sessionData.max_players) {
        toast.error('This game is full');
        return false;
      }

      // Check if player is already in the game
      if (sessionData.game_players.some((p: any) => p.player_id === user.id)) {
        navigate(`/lobby/${gameId}`);
        return true;
      }

      // Add player to the game
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameId,
          player_id: user.id,
          player_number: sessionData.current_players
        });

      if (playerError) throw playerError;

      // Update current player count
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ 
          current_players: sessionData.current_players + 1 
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Joined game successfully');
      navigate(`/lobby/${gameId}`);
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
      // Verify user is the creator
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, game_players(*)')
        .eq('id', gameId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData.creator_id !== user.id) {
        toast.error('Only the game creator can start the game');
        return false;
      }

      if (sessionData.current_players < 2) {
        toast.error('You need at least 2 players to start a game');
        return false;
      }

      // Update game state to active
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          status: 'active'
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast.success('Game started!');
      navigate(`/multiplayer/${gameId}`);
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
    startGameSession,
    fetchGameSessions
  };
}
