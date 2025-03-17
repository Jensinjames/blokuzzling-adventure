
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GameSession, GameInvite } from '@/types/database';
import { Trophy, Users, Calendar, AlertCircle, Clock, X, Check } from 'lucide-react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { motion } from 'framer-motion';

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
    return (
      <div className="glass-panel flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-24 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {invites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            Game Invites
          </h2>

          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-yellow-200 dark:border-yellow-900"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{invite.sender?.username} invited you to a game</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(invite.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespondToInvite(invite.id, false)}
                      className="h-8 px-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRespondToInvite(invite.id, true)}
                      className="h-8 px-2"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {userSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            Your Active Games
          </h2>

          <div className="space-y-3">
            {userSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Game {session.id.substr(0, 8)}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        session.status === 'waiting'
                          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                      }`}>
                        {session.status === 'waiting' ? 'Waiting' : 'Active'}
                      </span>
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      <span className="mr-3">{session.current_players}/{session.max_players} players</span>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => session.status === 'waiting' 
                      ? handleViewGame(session.id) 
                      : handlePlayGame(session.id)
                    }
                  >
                    {session.status === 'waiting' ? 'View' : 'Play'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Available Games
        </h2>

        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions
              .filter(session => !userSessions.some(us => us.id === session.id))
              .map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Game {session.id.substr(0, 8)}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        <span className="mr-3">{session.current_players}/{session.max_players} players</span>
                        <Clock className="h-3 w-3 inline mr-1" />
                        <span>{new Date(session.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinGame(session.id)}
                      disabled={session.current_players >= session.max_players}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No public games available right now.</p>
            <p className="text-sm mt-1">Create a new game to start playing!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GameList;
