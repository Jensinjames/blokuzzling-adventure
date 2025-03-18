
import { useState } from 'react';
import { GameSession } from '@/types/database';

/**
 * Manages game sessions state
 */
export function useGameSessionsState() {
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  return {
    activeSessions,
    setActiveSessions,
    userSessions,
    setUserSessions,
    loading,
    setLoading,
    error,
    setError
  };
}
