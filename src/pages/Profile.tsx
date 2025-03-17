
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '@/components/ProfileView';
import { supabase } from '@/integrations/supabase/client';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [games, setGames] = useState<GameSession[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      fetchUserGames();
    }
  }, [profile]);

  useEffect(() => {
    // If no user is logged in, redirect to auth page
    if (!user && !profileLoading) {
      console.log('No user detected, redirecting to auth page');
      navigate('/auth');
    }
  }, [user, profileLoading, navigate]);

  const fetchUserGames = async () => {
    if (!profile) return;
    
    try {
      setGamesLoading(true);
      console.log('Fetching games for user:', profile.id);
      
      // Get games created by this user
      const { data: createdGames, error: createdGamesError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (createdGamesError) {
        console.error('Error fetching created games:', createdGamesError);
        throw createdGamesError;
      }
      
      console.log('Created games:', createdGames);
      
      // Get games participated in by this user through game_players
      const { data: participatedGames, error: participatedGamesError } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('player_id', profile.id);
        
      if (participatedGamesError) {
        console.error('Error fetching participated games:', participatedGamesError);
        throw participatedGamesError;
      }
      
      console.log('Participated game IDs:', participatedGames);
      
      // Get full game details for participated games
      const participatedGameIds = participatedGames?.map(pg => pg.game_id) || [];
      let allGames = [...(createdGames || [])];
      
      if (participatedGameIds.length > 0) {
        const { data: gameData, error: gameDataError } = await supabase
          .from('game_sessions')
          .select('*')
          .in('id', participatedGameIds)
          .order('created_at', { ascending: false });
          
        if (gameDataError) {
          console.error('Error fetching game details:', gameDataError);
          throw gameDataError;
        }
        
        console.log('Game details for participated games:', gameData);
        
        // Combine both sets of games and remove duplicates
        if (gameData) {
          const uniqueGameIds = new Set();
          allGames.forEach(game => uniqueGameIds.add(game.id));
          
          gameData.forEach(game => {
            if (!uniqueGameIds.has(game.id)) {
              allGames.push(game);
              uniqueGameIds.add(game.id);
            }
          });
        }
      }
      
      // Sort combined games by date
      allGames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      console.log('Final game list:', allGames);
      setGames(allGames);
    } catch (error: any) {
      console.error('Error fetching user games:', error);
      toast.error(`Failed to load games: ${error.message}`);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Profile Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{profileError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
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
      signOut={handleSignOut}
      games={games}
      gamesLoading={gamesLoading}
    />
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We couldn't find your profile. This could be because you're new to the platform.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Profile;
