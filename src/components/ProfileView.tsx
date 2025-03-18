
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, GameSession } from '@/types/database';
import ProfileHeader from './profile/ProfileHeader';
import ProfileTabs from './profile/ProfileTabs';

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
  games?: GameSession[];
  gamesLoading?: boolean;
  onGameDeleted?: (gameId: string) => void;
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
  signOut,
  games = [],
  gamesLoading = false,
  onGameDeleted
}) => {
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
            <ProfileHeader
              profile={profile}
              username={username}
              setUsername={setUsername}
              isEditing={editing}
              onEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={handleUpdateProfile}
              saving={saving}
            />

            <ProfileTabs 
              profile={profile} 
              games={games} 
              gamesLoading={gamesLoading} 
              onGameDeleted={onGameDeleted}
            />

            <Separator className="my-2" />

            <div className="flex justify-center p-4">
              <Button 
                variant="outline" 
                onClick={signOut} 
                className="text-gray-600 dark:text-gray-400 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
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
