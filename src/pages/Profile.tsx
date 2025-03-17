
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '@/components/ProfileView';

const Profile = () => {
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!username.trim()) return;
    
    setSaving(true);
    await updateProfile({ username });
    setSaving(false);
    setEditing(false);
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
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
      signOut={signOut}
    />
  ) : null;
};

export default Profile;
