
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameInvite } from '@/types/database';
import { toast } from 'sonner';

export function useGameInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game invites
  const fetchGameInvites = async () => {
    if (!user) return;

    try {
      // Fetch pending invites for the user
      const { data, error } = await supabase
        .from('game_invites')
        .select(`
          *,
          sender:profiles!game_invites_sender_id_fkey(id, username, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInvites((data || []) as GameInvite[]);
    } catch (error) {
      console.error('Error fetching game invites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to invites
  useEffect(() => {
    if (!user) return;

    fetchGameInvites();

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
          fetchGameInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inviteChannel);
    };
  }, [user]);

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
        .ilike('username', username)
        .single();

      if (userError || !userData) {
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

      if (inviteCheckError) throw inviteCheckError;

      if (existingInvite && existingInvite.length > 0) {
        toast.info('An invite has already been sent to this player');
        return true;
      }

      // Create the invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert([{
          game_id: gameId,
          sender_id: user.id,
          recipient_id: userData.id,
          status: 'pending'
        }]);

      if (inviteError) throw inviteError;

      // Create notification for the recipient
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: userData.id,
          content: 'You have been invited to a game',
          type: 'game_invite'
        }]);

      if (notificationError) console.error('Error creating notification:', notificationError);

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

      if (inviteError || !inviteData) throw inviteError;

      // Update invite status
      const { error: updateError } = await supabase
        .from('game_invites')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      if (accept && inviteData.game) {
        // Check if game is still available
        if (inviteData.game.status !== 'waiting') {
          toast.error('This game is no longer accepting players');
          return;
        }

        if (inviteData.game.current_players >= inviteData.game.max_players) {
          toast.error('This game is full');
          return;
        }

        // Use gameSessionsHook to join the game
        // This is handled in the main useMultiplayer hook
      } else {
        toast.info('Invite declined');
      }
    } catch (error: any) {
      toast.error(`Failed to respond to invite: ${error.message}`);
    }
  };

  return {
    invites,
    loading,
    invitePlayer,
    respondToInvite,
    fetchGameInvites
  };
}
