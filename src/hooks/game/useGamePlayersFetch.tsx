
import { useState, useEffect } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GamePlayer, Profile } from '@/types/database';
import { toast } from 'sonner';

export function useGamePlayersFetch(gameId: string) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGamePlayers = async () => {
      try {
        // Fetch players with profiles
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('game_id', gameId)
          .order('player_number', { ascending: true });

        if (playersError) {
          throw playersError;
        }
        
        if (!playersData || !Array.isArray(playersData)) {
          throw new Error("No players found for this game");
        }

        // Safely cast to the expected type
        const typedPlayersData = safeDataCast<GamePlayer & { profile: Profile }>(playersData);
        setPlayers(typedPlayersData);
        console.log('Game players loaded:', typedPlayersData.length);

        // Find current player's number
        const currentPlayer = typedPlayersData.find((p) => p.player_id === user.id);
        if (currentPlayer) {
          setPlayerNumber(currentPlayer.player_number);
          console.log('Current player number:', currentPlayer.player_number);
        }
      } catch (error: any) {
        console.error('Error fetching game players:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamePlayers();
  }, [gameId, user]);

  return { players, playerNumber, loading, error };
}
