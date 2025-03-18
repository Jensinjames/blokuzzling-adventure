
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSession, GameInvite } from '@/types/database';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
  const { joinGameSession, respondToInvite } = useMultiplayer();

  const handleJoinGame = async (gameId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
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

  // Filter out games that don't belong to the current user
  const filteredUserSessions = user ? userSessions.filter(session => 
    session.creator_id === user.id
  ) : [];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {user && (
        <InvitesSection 
          invites={invites} 
          onRespond={handleRespondToInvite}
          formatTimeRemaining={formatTimeRemaining}
        />
      )}
      
      {user && filteredUserSessions.length > 0 && (
        <UserGamesSection 
          userSessions={filteredUserSessions}
          onView={handleViewGame}
          onPlay={handlePlayGame}
        />
      )}
      
      <AvailableGamesSection 
        activeSessions={activeSessions}
        userSessions={filteredUserSessions}
        onJoin={handleJoinGame}
      />
    </div>
  );
};

export default GameList;
