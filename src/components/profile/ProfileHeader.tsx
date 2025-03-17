
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Star, X, Save, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Profile } from '@/types/database';
import PlayerRank from './PlayerRank';

interface ProfileHeaderProps {
  profile: Profile;
  username: string;
  setUsername: (username: string) => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  saving: boolean;
  handleUpdateProfile: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  username,
  setUsername,
  editing,
  setEditing,
  saving,
  handleUpdateProfile
}) => {
  // Helper function to get the avatar URL from the array format
  const getAvatarUrl = () => {
    if (!profile.avatar_url || profile.avatar_url.length === 0) {
      return null;
    }
    // Use the first item in the array
    return profile.avatar_url[0]?.toString();
  };

  return (
    <div className="relative">
      {/* Profile header with gradient background */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-purple-500/90 to-indigo-600/90 rounded-t-xl" />
      
      <div className="relative pt-16 px-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-md">
              {profile.avatar_url && profile.avatar_url.length > 0 ? (
                <AvatarImage src={getAvatarUrl()} alt={profile.username} />
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
                  <PlayerRank profile={profile} />
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
  );
};

export default ProfileHeader;
