
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import ProfileView from '@/components/ProfileView';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileError from '@/components/profile/ProfileError';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import { useUserGames } from '@/hooks/useUserGames';
import { toast } from 'sonner';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuth } from '@/context/AuthProvider';

const Profile = () => {
  const { profile, loading: profileLoading, error: profileError, updateProfile, saving } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const { games, loading: gamesLoading } = useUserGames(profile);
  
  // Use our auth check hook
  const { user, isLoading: authLoading } = useAuthCheck();
  
  const isLoading = profileLoading || authLoading;

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    try {
      await updateProfile({ username });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    console.log('Initiating sign out from Profile page');
    try {
      await signOut();
      // Navigation is handled in the signOut function
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

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
    />
  ) : (
    <ProfileNotFound message="We couldn't find your profile data" />
  );
};

export default Profile;
