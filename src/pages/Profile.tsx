
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '@/components/ProfileView';
import { supabase } from '@/integrations/supabase/client';
import { GameSession } from '@/types/database';

const Profile = () => {
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { signOut } = useAuth();
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

  const fetchUserGames = async () => {
    if (!profile) return;
    
    try {
      setGamesLoading(true);
      
      // Get games created by this user
      const { data: createdGames, error: createdGamesError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (createdGamesError) throw createdGamesError;
      
      // Get games participated in by this user through game_players
      const { data: participatedGames, error: participatedGamesError } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('player_id', profile.id);
        
      if (participatedGamesError) throw participatedGamesError;
      
      // Get full game details for participated games
      const participatedGameIds = participatedGames.map(pg => pg.game_id);
      let allGames = [...(createdGames || [])];
      
      if (participatedGameIds.length > 0) {
        const { data: gameData, error: gameDataError } = await supabase
          .from('game_sessions')
          .select('*')
          .in('id', participatedGameIds)
          .order('created_at', { ascending: false });
          
        if (gameDataError) throw gameDataError;
        
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
      setGames(allGames);
    } catch (error) {
      console.error('Error fetching user games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

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
      games={games}
      gamesLoading={gamesLoading}
    />
  ) : null;
};

export default Profile;
