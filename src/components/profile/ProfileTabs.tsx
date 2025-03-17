
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileStats from './ProfileStats';
import ProfileAchievements from './ProfileAchievements';
import GameHistory from './GameHistory';
import { Profile, GameSession } from '@/types/database';

interface ProfileTabsProps {
  profile: Profile;
  games?: GameSession[];
  gamesLoading?: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  profile, 
  games = [], 
  gamesLoading = false 
}) => {
  return (
    <Tabs defaultValue="stats" className="w-full">
      <div className="px-6">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="stats" className="px-6 pb-6 focus-visible:outline-none focus-visible:ring-0">
        <ProfileStats profile={profile} />
      </TabsContent>
      
      <TabsContent value="history" className="px-6 pb-6 focus-visible:outline-none focus-visible:ring-0">
        <GameHistory games={games} loading={gamesLoading} />
      </TabsContent>
      
      <TabsContent value="achievements" className="px-6 pb-6 focus-visible:outline-none focus-visible:ring-0">
        <ProfileAchievements profile={profile} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
