
import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { GameSession } from '@/types/database';
import GameSessionItem from './GameSessionItem';

interface AvailableGamesSectionProps {
  activeSessions: GameSession[];
  userSessions: GameSession[];
  onJoin: (gameId: string) => void;
}

const AvailableGamesSection: React.FC<AvailableGamesSectionProps> = ({
  activeSessions,
  userSessions,
  onJoin
}) => {
  const availableSessions = activeSessions
    .filter(session => !userSessions.some(us => us.id === session.id));

  return (
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

      {availableSessions.length > 0 ? (
        <div className="space-y-3">
          {availableSessions.map((session) => (
            <GameSessionItem
              key={session.id}
              session={session}
              onView={() => {}} // Not used for available sessions
              onPlay={() => {}} // Not used for available sessions
              onJoin={onJoin}
              isUserSession={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No public games available right now.</p>
          <p className="text-sm mt-1">Create a new game to start playing!</p>
        </div>
      )}
    </motion.div>
  );
};

export default AvailableGamesSection;
