
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameSession, Profile } from '@/types/database';
import { toast } from 'sonner';

export function useUserGames(profile: Profile | null) {
  const [games, setGames] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setGames([]);
      setLoading(false);
      return;
    }

    const fetchUserGames = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchUserGames();
  }, [profile]);

  return { games, loading };
}
