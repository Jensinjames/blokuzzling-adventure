
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Trophy, X, Award, Medal, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-xl font-bold text-center dark:text-white">Your Profile</h1>
          <div className="w-6"></div>
        </header>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-8 w-8" />
                </div>
                {editing ? (
                  <div className="flex-1">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="text-lg font-semibold"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">{profile.username}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </p>
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

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Game Statistics
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="mb-1">
                    <Award className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.wins}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="mb-1">
                    <X className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{profile.losses}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="mb-1">
                    <Medal className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.draws}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-center">
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
