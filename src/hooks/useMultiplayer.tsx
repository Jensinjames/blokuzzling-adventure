
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
    respondToInvite: baseRespondToInvite,
    fetchGameInvites
  } = useMultiplayerInvites();

  const { invitePlayer } = useMultiplayerInviteSender();

  // Fixed handleRespondToInvite to properly handle the joinGameSession call
  const handleRespondToInvite = async (inviteId: string, accept: boolean) => {
    try {
      if (!accept) {
        // If declining, just respond with false and don't try to join
        await baseRespondToInvite(inviteId, false);
        return false;
      }
      
      // Find the invite to get the game_id before responding
      const invite = invites?.find(inv => inv.id === inviteId);
      if (!invite) {
        console.error('Invite not found');
        return false;
      }
      
      // Now respond to the invite and pass the joinGameSession function
      // Previously we were passing only 2 args but the function expects 3
      const success = await baseRespondToInvite(inviteId, true, joinGameSession);
      return success;
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
