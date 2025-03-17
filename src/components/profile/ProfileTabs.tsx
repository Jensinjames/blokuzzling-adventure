
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileStats from './ProfileStats';
import ProfileAchievements from './ProfileAchievements';
import { Profile } from '@/types/database';

interface ProfileTabsProps {
  profile: Profile;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ profile }) => {
  return (
    <Tabs defaultValue="stats" className="w-full">
      <div className="px-6">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="stats">Game Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="stats" className="px-6 pb-6 focus-visible:outline-none focus-visible:ring-0">
        <ProfileStats profile={profile} />
      </TabsContent>
      
      <TabsContent value="achievements" className="px-6 pb-6 focus-visible:outline-none focus-visible:ring-0">
        <ProfileAchievements profile={profile} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
