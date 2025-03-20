
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';
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
  signOut,
  games = [],
  gamesLoading = false,
  onGameDeleted
}) => {
  return (
    <>
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

      <div className="flex justify-center p-4 gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/#/settings'} 
          className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-900/30"
        >
          Subscription Settings
        </Button>
        
        <Button 
          variant="outline" 
          onClick={signOut} 
          className="text-gray-600 dark:text-gray-400 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default ProfileView;
