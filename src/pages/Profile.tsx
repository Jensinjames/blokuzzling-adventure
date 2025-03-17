
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProfileView from '@/components/ProfileView';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileError from '@/components/profile/ProfileError';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import { useUserGames } from '@/hooks/useUserGames';

const Profile = () => {
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { games, loading: gamesLoading } = useUserGames(profile);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    // If no user is logged in, redirect to auth page
    if (!user && !profileLoading) {
      console.log('No user detected, redirecting to auth page');
      navigate('/auth');
    }
  }, [user, profileLoading, navigate]);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      return;
    }
    
    setSaving(true);
    await updateProfile({ username });
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    console.log('Initiating sign out from Profile page');
    await signOut();
    navigate('/auth');
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (profileLoading) {
    return <ProfileLoading />;
  }

  if (profileError) {
    return <ProfileError error={profileError} />;
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
    <ProfileNotFound />
  );
};

export default Profile;
