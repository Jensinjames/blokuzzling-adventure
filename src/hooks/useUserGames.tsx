
import { useState, useEffect } from 'react';
import { supabase, apiSchema, safeDataCast } from '@/integrations/supabase/client';
import { GameSession, Profile } from '@/types/database';
import { toast } from 'sonner';

export function useUserGames(profile: Profile | null) {
  const [games, setGames] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setGames([]);
      setLoading(false);
      return;
    }

    const fetchUserGames = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching games for user:', profile.id);
        
        // Get games created by this user
        const { data: createdGames, error: createdGamesError } = await apiSchema.game_sessions()
          .select('*')
          .eq('creator_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (createdGamesError) {
          console.error('Error fetching created games:', createdGamesError);
          throw createdGamesError;
        }
        
        console.log('Created games:', createdGames?.length || 0);
        
        // Get games participated in by this user through game_players
        const { data: participatedGames, error: participatedGamesError } = await apiSchema.game_players()
          .select('game_id')
          .eq('player_id', profile.id);
          
        if (participatedGamesError) {
          console.error('Error fetching participated games:', participatedGamesError);
          throw participatedGamesError;
        }
        
        console.log('Participated games:', participatedGames?.length || 0);
        
        // Get full game details for participated games
        let allGames: GameSession[] = [];
        
        if (createdGames) {
          allGames = safeDataCast<GameSession>(createdGames);
        }
        
        if (participatedGames && participatedGames.length > 0) {
          const participatedData = safeDataCast<{game_id: string}>(participatedGames);
          const gameIds = participatedData.map(pg => pg.game_id);
          
          // Only fetch if we have game IDs
          if (gameIds.length > 0) {
            const { data: gameData, error: gameDataError } = await apiSchema.game_sessions()
              .select('*')
              .in('id', gameIds)
              .order('created_at', { ascending: false });
              
            if (gameDataError) {
              console.error('Error fetching game details:', gameDataError);
              throw gameDataError;
            }
            
            console.log('Game details for participated games:', gameData?.length || 0);
            
            // Combine both sets of games and remove duplicates
            if (gameData) {
              const gameSessionsData = safeDataCast<GameSession>(gameData);
              const uniqueGameIds = new Set();
              allGames.forEach(game => uniqueGameIds.add(game.id));
              
              gameSessionsData.forEach(game => {
                if (!uniqueGameIds.has(game.id)) {
                  allGames.push(game);
                  uniqueGameIds.add(game.id);
                }
              });
            }
          }
        }
        
        // Sort combined games by date
        allGames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        console.log('Final game list:', allGames.length);
        setGames(allGames);
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error fetching games';
        console.error('Error fetching user games:', error);
        setError(errorMessage);
        toast.error(`Failed to load games: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGames();
  }, [profile]);

  return { games, loading, error };
}
