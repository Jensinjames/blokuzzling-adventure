
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/integrations/supabase/client';

interface ProfileHeaderProps {
  profile: {
    username: string;
    avatar_url: string | any[];
    wins?: number;
    losses?: number;
    draws?: number;
  };
  isEditing: boolean;
  username: string;
  setUsername: (value: string) => void;
  onSave?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  saving: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing,
  username,
  setUsername,
  onSave,
  onEdit,
  onCancel,
  saving
}) => {
  // Extract avatar URL safely using our helper
  const avatarUrl = getAvatarUrl(profile.avatar_url) || '';
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Avatar className="h-24 w-24">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={profile.username} />
        ) : (
          <AvatarFallback>{profile.username?.substring(0, 2)?.toUpperCase() || '??'}</AvatarFallback>
        )}
      </Avatar>
      
      {isEditing ? (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Username" 
            className="text-center"
          />
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={onSave} className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <Button onClick={onEdit} variant="outline" size="sm">
            Edit Profile
          </Button>
        </div>
      )}
      
      <div className="flex gap-4 text-center">
        <div>
          <p className="font-semibold">{profile.wins || 0}</p>
          <p className="text-sm text-muted-foreground">Wins</p>
        </div>
        <div>
          <p className="font-semibold">{profile.losses || 0}</p>
          <p className="text-sm text-muted-foreground">Losses</p>
        </div>
        <div>
          <p className="font-semibold">{profile.draws || 0}</p>
          <p className="text-sm text-muted-foreground">Draws</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
