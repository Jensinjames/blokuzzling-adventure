
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/profile';
import { useProfileActions } from '@/hooks/profile/useProfileActions';
import { useGameManagement } from '@/hooks/profile/useGameManagement';
import { useUserGames } from '@/hooks/useUserGames';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import ProfileView from '@/components/ProfileView';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileError from '@/components/profile/ProfileError';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import ProfilePageContainer from '@/components/profile/ProfilePageContainer';

const Profile = () => {
  const { profile, loading: profileLoading, error: profileError, updateProfile, saving } = useProfile();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthCheck();
  
  // Profile actions management
  const { 
    username, setUsername, 
    editing, setEditing, 
    initializeUsername, 
    handleUpdateProfile, 
    handleSignOut, 
  } = useProfileActions(profile, updateProfile, saving);
  
  // User games management
  const { games: fetchedGames, loading: gamesLoading } = useUserGames(profile);
  const { games, updateGames, handleGameDeleted } = useGameManagement(fetchedGames);

  // Combined loading state
  const isLoading = profileLoading || authLoading;

  // Initialize username when profile loads
  useEffect(() => {
    if (profile) {
      initializeUsername(profile);
    }
  }, [profile]);

  // Update games when fetched games change
  useEffect(() => {
    updateGames(fetchedGames);
  }, [fetchedGames]);

  const handleBack = () => {
    navigate('/home');
  };

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (profileError) {
    return <ProfileError error={profileError} />;
  }

  if (!user) {
    return <ProfileNotFound message="You need to be logged in to view your profile" />;
  }

  return profile ? (
    <ProfilePageContainer onBack={handleBack}>
      <ProfileView
        profile={profile}
        username={username}
        setUsername={setUsername}
        editing={editing}
        setEditing={setEditing}
        saving={saving}
        handleUpdateProfile={handleUpdateProfile}
        handleBack={handleBack}
        signOut={handleSignOut}
        games={games}
        gamesLoading={gamesLoading}
        onGameDeleted={handleGameDeleted}
      />
    </ProfilePageContainer>
  ) : (
    <ProfileNotFound message="We couldn't find your profile data" />
  );
};

export default Profile;
