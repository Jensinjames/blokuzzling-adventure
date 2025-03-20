
import { useGameSessionsFetch } from './useGameSessionsFetch';
import { useGameSessionCreate } from './useGameSessionCreate';
import { useGameSessionJoin } from './useGameSessionJoin';
import { useGameSessionStart } from './useGameSessionStart';

export function useGameSessions() {
  const { activeSessions, userSessions, loading } = useGameSessionsFetch();
  const { createGameSession } = useGameSessionCreate();
  const { joinGameSession } = useGameSessionJoin();
  const { startGameSession } = useGameSessionStart();

  return {
    activeSessions,
    userSessions,
    loading,
    createGameSession,
    joinGameSession,
    startGameSession
  };
}
