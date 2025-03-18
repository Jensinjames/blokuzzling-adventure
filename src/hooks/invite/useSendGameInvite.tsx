
import { useState } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useSendGameInvite() {
  const { user } = useAuth();
  const [inviting, setInviting] = useState(false);

  // Send an invite to another player
  const invitePlayer = async (gameId: string, username: string) => {
    if (!user) {
      toast.error('You must be logged in to invite players');
      return false;
    }

    try {
      setInviting(true);
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

      const recipientData = safeSingleDataCast<{ id: string }>(userData);

      // Check if invite already exists
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from('game_invites')
        .select('*')
        .eq('game_id', gameId)
        .eq('recipient_id', recipientData.id)
        .not('status', 'in', '("declined", "expired")');

      if (inviteCheckError) throw inviteCheckError;

      if (existingInvite && existingInvite.length > 0) {
        toast.info('An invite has already been sent to this player');
        return true;
      }

      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create the invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert({
          game_id: gameId,
          sender_id: user.id,
          recipient_id: recipientData.id,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        });

      if (inviteError) throw inviteError;

      // Create notification for the recipient
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientData.id,
          content: 'You have been invited to a game',
          type: 'game_invite'
        });

      if (notificationError) console.error('Error creating notification:', notificationError);

      toast.success(`Invite sent to ${username}`);
      return true;
    } catch (error: any) {
      toast.error(`Failed to send invite: ${error.message}`);
      return false;
    } finally {
      setInviting(false);
    }
  };

  return {
    invitePlayer,
    inviting
  };
}
