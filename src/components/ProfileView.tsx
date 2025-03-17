
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Trophy, X, Award, Medal, Save, Loader2, 
  ChevronRight, Gamepad2, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Profile } from '@/types/database';

interface ProfileViewProps {
  profile: Profile;
  username: string;
  setUsername: (username: string) => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  saving: boolean;
  handleUpdateProfile: () => Promise<void>;
  handleBack: () => void;
  signOut: () => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  username,
  setUsername,
  editing,
  setEditing,
  saving,
  handleUpdateProfile,
  handleBack,
  signOut
}) => {
  const [selectedTab, setSelectedTab] = useState('stats');

  // Calculate win rate
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </motion.button>
          <h1 className="text-xl font-bold text-center dark:text-white">Your Profile</h1>
          <div className="w-6"></div>
        </header>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel space-y-6 overflow-hidden bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            <div className="relative">
              {/* Profile header with gradient background */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-purple-500/90 to-indigo-600/90 rounded-t-xl" />
              
              <div className="relative pt-16 px-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-md">
                      {profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.username} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {editing ? (
                      <div className="flex-1 mt-2">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Username"
                          className="text-lg font-semibold"
                          maxLength={20}
                        />
                      </div>
                    ) : (
                      <div className="mt-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h2>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getPlayerRank()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setUsername(profile.username);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedTab('stats')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTab === 'stats'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Game Statistics
                </button>
                <button
                  onClick={() => setSelectedTab('achievements')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTab === 'achievements'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Achievements
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedTab === 'stats' ? (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
                      <Award className="h-5 w-5 mr-2 text-yellow-500" />
                      Your Achievements
                    </h3>
                  </div>

                  {/* Achievements cards based on profile data */}
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
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="my-2" />

            <div className="flex justify-center p-4">
              <Button variant="outline" onClick={signOut} className="text-gray-600 dark:text-gray-400">
                Sign Out
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileView;
