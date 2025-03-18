
import { useAuth } from '@/hooks/useAuth';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { GameInvite } from '@/types/database';
import { toast } from 'sonner';

export function useRespondToInvite() {
  const { user } = useAuth();

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

      // Check if invite has expired
      const typedInviteData = safeSingleDataCast<GameInvite & { game: any }>(inviteData);
      if (typedInviteData.expires_at && new Date(typedInviteData.expires_at) < new Date()) {
        // Update invite status to expired
        await supabase
          .from('game_invites')
          .update({ status: 'expired' })
          .eq('id', inviteId);
          
        toast.error('This invite has expired');
        return;
      }

      // Update invite status
      const { error: updateError } = await supabase
        .from('game_invites')
        .update({ 
          status: accept ? 'accepted' : 'declined' 
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      if (accept && typedInviteData.game) {
        // Check if game is still available
        if (typedInviteData.game.status !== 'waiting') {
          toast.error('This game is no longer accepting players');
          return;
        }

        if (typedInviteData.game.current_players >= typedInviteData.game.max_players) {
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
    respondToInvite
  };
}
