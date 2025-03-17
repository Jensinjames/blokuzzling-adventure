
import { useGameSessions } from './useGameSessions';
import { useGameInvites } from './useGameInvites';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useMultiplayer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    activeSessions,
    userSessions,
    loading: sessionsLoading,
    createGameSession,
    joinGameSession,
    startGameSession
  } = useGameSessions();
  
  const {
    invites,
    loading: invitesLoading,
    invitePlayer,
    respondToInvite: baseRespondToInvite,
    fetchGameInvites
  } = useGameInvites();

  // Extended respondToInvite that handles game joining after accepting
  const respondToInvite = async (inviteId: string, accept: boolean) => {
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
      
      if (accept && invites) {
        // Find the invite that was just accepted
        const invite = invites.find(inv => inv.id === inviteId);
        if (invite) {
          // Join the game session
          const success = await joinGameSession(invite.game_id);
          if (success) {
            // Navigate to the lobby page
            navigate(`/lobby/${invite.game_id}`);
            return true;
          }
        }
      }
      
      return accept;
    } catch (error: any) {
      toast.error(`Failed to respond to invite: ${error.message}`);
      return false;
    }
  };
  
  return {
    activeSessions,
    userSessions,
    invites,
    loading: sessionsLoading || invitesLoading,
    createGameSession,
    joinGameSession,
    invitePlayer,
    respondToInvite,
    startGameSession
  };
}
