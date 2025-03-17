
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Sparkles, Gamepad2, Star } from 'lucide-react';
import { Award } from 'lucide-react';
import { Profile } from '@/types/database';

interface ProfileAchievementsProps {
  profile: Profile;
}

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({ profile }) => {
  const calculateWinRate = () => {
    const totalGames = profile.wins + profile.losses + profile.draws;
    if (totalGames === 0) return 0;
    return Math.round((profile.wins / totalGames) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Your Achievements
        </h3>
      </div>

      <div className="space-y-3">
        {profile.wins > 0 && (
          <Card className="border border-indigo-100 dark:border-indigo-900/40 bg-white/60 dark:bg-gray-800/60">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full">
                <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">First Victory</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Won your first game</p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.wins >= 5 && (
          <Card className="border border-purple-100 dark:border-purple-900/40 bg-white/60 dark:bg-gray-800/60">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Winning Streak</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Won 5 or more games</p>
              </div>
            </CardContent>
          </Card>
        )}

        {(profile.wins + profile.losses + profile.draws) >= 10 && (
          <Card className="border border-emerald-100 dark:border-emerald-900/40 bg-white/60 dark:bg-gray-800/60">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full">
                <Gamepad2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Dedicated Player</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Played 10 or more games</p>
              </div>
            </CardContent>
          </Card>
        )}

        {calculateWinRate() >= 50 && (profile.wins + profile.losses + profile.draws) >= 5 && (
          <Card className="border border-amber-100 dark:border-amber-900/40 bg-white/60 dark:bg-gray-800/60">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Strategic Genius</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Maintain a 50%+ win rate after 5+ games</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* If the player has no achievements yet */}
        {profile.wins === 0 && (profile.wins + profile.losses + profile.draws) < 5 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="text-gray-500 dark:text-gray-400 mb-1">No achievements yet</h4>
            <p className="text-sm text-gray-400 dark:text-gray-500">Play more games to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAchievements;
