
import { useCallback } from 'react';
import { useGameSessionsState } from './useGameSessionsState';
import { useGameSessionsFetcher } from './useGameSessionsFetcher';
import { useGameSessionsRefresher } from './useGameSessionsRefresher';
import { useGameSessionsSubscription } from './useGameSessionsSubscription';

/**
 * Combined hook that fetches game sessions with real-time updates
 */
export function useGameSessionsFetch() {
  const {
    activeSessions,
    setActiveSessions,
    userSessions,
    setUserSessions,
    loading,
    setLoading,
    error,
    setError
  } = useGameSessionsState();

  const { fetchGameSessions } = useGameSessionsFetcher(
    setActiveSessions,
    setUserSessions,
    setLoading,
    setError
  );

  const { refreshSessions } = useGameSessionsRefresher(
    setActiveSessions,
    setUserSessions,
    setLoading,
    setError
  );

  // Use useCallback to memoize the fetchGameSessions function
  // This prevents infinite re-renders when used in useEffect dependencies
  const memoizedFetchGameSessions = useCallback(fetchGameSessions, [fetchGameSessions]);

  // Set up real-time subscriptions
  useGameSessionsSubscription(memoizedFetchGameSessions);

  // Fetch game sessions on component mount
  useCallback(() => {
    fetchGameSessions();
  }, [fetchGameSessions])();

  return {
    activeSessions,
    userSessions,
    loading,
    error,
    refreshSessions
  };
}
