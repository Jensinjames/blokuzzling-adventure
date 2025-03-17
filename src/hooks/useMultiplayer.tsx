
import { useGameSessions } from './useGameSessions';
import { useGameInvites } from './useGameInvites';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';

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
    respondToInvite: baseRespondToInvite
  } = useGameInvites();

  // Extended respondToInvite that handles game joining after accepting
  const respondToInvite = async (inviteId: string, accept: boolean) => {
    await baseRespondToInvite(inviteId, accept);
    
    if (accept && invites) {
      // Find the invite that was just accepted
      const invite = invites.find(inv => inv.id === inviteId);
      if (invite) {
        // Join the game session
        await joinGameSession(invite.game_id);
      }
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
