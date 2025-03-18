
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSession, GameInvite } from '@/types/database';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import LoadingState from './game-list/LoadingState';
import InvitesSection from './game-list/InvitesSection';
import UserGamesSection from './game-list/UserGamesSection';
import AvailableGamesSection from './game-list/AvailableGamesSection';
import { formatTimeRemaining } from './game-list/GameListUtils';

interface GameListProps {
  activeSessions: GameSession[];
  userSessions: GameSession[];
  invites: GameInvite[];
  loading: boolean;
}

const GameList: React.FC<GameListProps> = ({
  activeSessions,
  userSessions,
  invites,
  loading
}) => {
  const navigate = useNavigate();
  const { joinGameSession, respondToInvite } = useMultiplayer();

  const handleJoinGame = async (gameId: string) => {
    await joinGameSession(gameId);
  };

  const handleViewGame = (gameId: string) => {
    navigate(`/lobby/${gameId}`);
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/multiplayer/${gameId}`);
  };

  const handleRespondToInvite = async (inviteId: string, accept: boolean) => {
    await respondToInvite(inviteId, accept);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <InvitesSection 
        invites={invites} 
        onRespond={handleRespondToInvite}
        formatTimeRemaining={formatTimeRemaining}
      />
      
      <UserGamesSection 
        userSessions={userSessions}
        onView={handleViewGame}
        onPlay={handlePlayGame}
      />
      
      <AvailableGamesSection 
        activeSessions={activeSessions}
        userSessions={userSessions}
        onJoin={handleJoinGame}
      />
    </div>
  );
};

export default GameList;
