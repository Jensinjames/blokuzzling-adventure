
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

  // Fixed handleRespondToInvite to correctly pass the joinGameSession function
  // and handle the response appropriately
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
      const success = await baseRespondToInvite(inviteId, true, joinGameSession);
      
      // The success value is a boolean since we're not using the return value
      // from the baseRespondToInvite function directly anymore
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
