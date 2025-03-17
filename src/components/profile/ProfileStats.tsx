
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Sparkles, Award, X, Medal } from 'lucide-react';
import { Profile } from '@/types/database';

interface ProfileStatsProps {
  profile: Profile;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  // Calculate win rate
  const calculateWinRate = () => {
    const totalGames = profile.wins + profile.losses + profile.draws;
    if (totalGames === 0) return 0;
    return Math.round((profile.wins / totalGames) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Game Performance
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base text-blue-600 dark:text-blue-400 flex items-center">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games Played
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.wins + profile.losses + profile.draws}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border-0 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base text-purple-600 dark:text-purple-400 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {calculateWinRate()}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg text-center shadow-md">
          <div className="mb-1">
            <Award className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.wins}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-lg text-center shadow-md">
          <div className="mb-1">
            <X className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{profile.losses}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-4 rounded-lg text-center shadow-md">
          <div className="mb-1">
            <Medal className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.draws}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
