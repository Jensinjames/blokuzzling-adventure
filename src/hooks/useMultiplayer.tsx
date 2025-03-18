
import { useState, useEffect } from 'react';
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

  const handleRespondToInvite = async (inviteId: string, accept: boolean) => {
    try {
      const success = await respondToInvite(inviteId, accept);
      if (success && accept && success.gameId) {
        await joinGameSession(success.gameId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error responding to invite:', error);
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
    respondToInvite: handleRespondToInvite,
    startGameSession,
    fetchGameInvites
  };
}
