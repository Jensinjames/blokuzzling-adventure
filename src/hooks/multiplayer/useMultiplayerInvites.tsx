
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGameInvites } from '@/hooks/useGameInvites';
import { toast } from 'sonner';

export function useMultiplayerInvites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    invites,
    loading: invitesLoading,
    respondToInvite: baseRespondToInvite,
    fetchGameInvites
  } = useGameInvites();

  // Refactored respondToInvite to properly handle the joinGameSession function
  const respondToInvite = async (
    inviteId: string, 
    accept: boolean, 
    joinGameSession?: (gameId: string) => Promise<boolean>
  ) => {
    if (!user) {
      toast.error('You must be logged in to respond to invites');
      return false;
    }
    
    try {
      // Check if invite has expired before responding
      const invite = invites?.find(inv => inv.id === inviteId);
      if (invite && invite.status === 'expired') {
        toast.error('This invite has expired');
        await fetchGameInvites(); // Refresh invites
        return false;
      }
      
      await baseRespondToInvite(inviteId, accept);
      
      if (accept && invite && joinGameSession) {
        // Join the game session if accepted and joinGameSession is provided
        const success = await joinGameSession(invite.game_id);
        if (success) {
          // Navigate to the lobby page
          navigate(`/lobby/${invite.game_id}`);
          return true;
        }
      }
      
      return accept;
    } catch (error: any) {
      toast.error(`Failed to respond to invite: ${error.message}`);
      return false;
    }
  };
  
  return {
    invites,
    invitesLoading,
    respondToInvite,
    fetchGameInvites
  };
}
