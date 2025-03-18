
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useGameAccess(gameId: string | undefined) {
  const { user } = useAuth();
  const [isCreator, setIsCreator] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkGameAccess = async () => {
      if (!user || !gameId) {
        setHasAccess(false);
        setIsCreator(false);
        setIsPlayer(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if user is a player in this game
        const { data: playerData, error: playerError } = await supabase
          .from('game_players')
          .select('*')
          .eq('game_id', gameId)
          .eq('player_id', user.id);

        if (playerError) throw playerError;
        
        const isPlayerInGame = playerData && playerData.length > 0;
        setIsPlayer(isPlayerInGame);

        // Check if user is the creator
        const { data: gameData, error: gameError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;
        
        const isGameCreator = gameData && gameData.creator_id === user.id;
        setIsCreator(isGameCreator);

        // Set access status
        const userHasAccess = isPlayerInGame || isGameCreator;
        setHasAccess(userHasAccess);

        // If no access, redirect to home
        if (!userHasAccess) {
          toast.error('You do not have access to this game');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking game access:', error);
        setHasAccess(false);
        toast.error('Failed to verify game access');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    checkGameAccess();
  }, [user, gameId, navigate]);

  return { 
    isCreator, 
    isPlayer, 
    hasAccess, 
    loading 
  };
}
