
import React from 'react';
import { Profile } from '@/types/database';

interface PlayerRankProps {
  profile: Profile;
}

const PlayerRank: React.FC<PlayerRankProps> = ({ profile }) => {
  const calculateWinRate = () => {
    const totalGames = profile.wins + profile.losses + profile.draws;
    if (totalGames === 0) return 0;
    return Math.round((profile.wins / totalGames) * 100);
  };

  const getPlayerRank = () => {
    const winRate = calculateWinRate();
    if (winRate >= 80) return 'Grandmaster';
    if (winRate >= 65) return 'Expert';
    if (winRate >= 50) return 'Skilled';
    if (winRate >= 30) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {getPlayerRank()}
    </span>
  );
};

export default PlayerRank;
