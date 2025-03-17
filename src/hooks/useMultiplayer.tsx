
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession, GamePlayer, GameInvite, Profile } from '@/types/database';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useMultiplayer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchGameData = async () => {
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
            
          setUserSessions(userSessionData || []);
        }

        // Fetch pending invites for the user
        const { data: inviteData } = await supabase
          .from('game_invites')
          .select(`
            *,
            sender:profiles!game_invites_sender_id_fkey(id, username, avatar_url)
          `)
          .eq('recipient_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        setActiveSessions(sessionData || []);
        setInvites(inviteData || []);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();

    // Subscribe to invites
    const inviteChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_invites',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          // Refresh invites when there's a change
          fetchGameData();
        }
      )
      .subscribe();

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
          // If one of user's sessions
          if (userSessions.some(s => s.id === payload.new.id)) {
            fetchGameData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inviteChannel);
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

  // Send an invite to another player
  const invitePlayer = async (gameId: string, username: string) => {
    if (!user) {
      toast.error('You must be logged in to invite players');
      return false;
    }

    try {
      // Find the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) {
        toast.error('User not found');
        return false;
      }

      // Check if invite already exists
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from('game_invites')
        .select('*')
        .eq('game_id', gameId)
        .eq('recipient_id', userData.id)
        .not('status', 'in', '("declined", "expired")');

      if (existingInvite && existingInvite.length > 0) {
        toast.info('An invite has already been sent to this player');
        return true;
      }

      // Create the invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert({
          game_id: gameId,
          sender_id: user.id,
          recipient_id: userData.id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      // Create notification for the recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: userData.id,
          content: 'You have been invited to a game',
          type: 'game_invite'
        });

      toast.success(`Invite sent to ${username}`);
      return true;
    } catch (error: any) {
      toast.error(`Failed to send invite: ${error.message}`);
      return false;
    }
  };

  // Respond to an invite
  const respondToInvite = async (inviteId: string, accept: boolean) => {
    if (!user) {
      toast.error('You must be logged in to respond to invites');
      return;
    }

    try {
      // Get invite details
      const { data: inviteData, error: inviteError } = await supabase
        .from('game_invites')
        .select('*, game:game_sessions(*)')
        .eq('id', inviteId)
        .single();

      if (inviteError) throw inviteError;

      // Update invite status
      const { error: updateError } = await supabase
        .from('game_invites')
        .update({
          status: accept ? 'accepted' : 'declined'
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      if (accept) {
        // Check if game is still available
        if (inviteData.game.status !== 'waiting') {
          toast.error('This game is no longer accepting players');
          return;
        }

        if (inviteData.game.current_players >= inviteData.game.max_players) {
          toast.error('This game is full');
          return;
        }

        // Add player to the game
        await joinGameSession(inviteData.game_id);
      } else {
        toast.info('Invite declined');
      }
    } catch (error: any) {
      toast.error(`Failed to respond to invite: ${error.message}`);
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
    invites,
    loading,
    createGameSession,
    joinGameSession,
    invitePlayer,
    respondToInvite,
    startGameSession
  };
}
