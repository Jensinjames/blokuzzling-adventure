
import { useGameSessions } from './useGameSessions';
import { useGameInvites } from './useGameInvites';
import { useMultiplayerInvites } from './multiplayer/useMultiplayerInvites';
import { useMultiplayerInviteSender } from './multiplayer/useMultiplayerInviteSender';
import { useAuth } from '@/hooks/useAuth';

export function useMultiplayer() {
  const { user } = useAuth();
  
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
    invitesLoading,
    respondToInvite,
    fetchGameInvites
  } = useMultiplayerInvites();

  const { invitePlayer } = useMultiplayerInviteSender();

  return {
    activeSessions,
    userSessions,
    invites,
    loading: sessionsLoading || invitesLoading,
    createGameSession,
    joinGameSession,
    invitePlayer,
    respondToInvite: (inviteId: string, accept: boolean) => 
      respondToInvite(inviteId, accept, joinGameSession),
    startGameSession,
    fetchGameInvites
  };
}
