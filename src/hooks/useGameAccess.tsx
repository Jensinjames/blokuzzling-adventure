
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
  const [creatorProfile, setCreatorProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkGameAccess = async () => {
      if (!user || !gameId) {
        setHasAccess(false);
        setIsCreator(false);
        setIsPlayer(false);
        setCreatorProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch the game data first
        const { data: gameData, error: gameError } = await supabase
          .from('game_sessions')
          .select('*, creator:creator_id(username, id, avatar_url)')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;
        if (!gameData) throw new Error('Game not found');
        
        // Store creator profile data
        setCreatorProfile(gameData.creator);
        
        // Check if user is the creator
        const isGameCreator = gameData && gameData.creator_id === user.id;
        setIsCreator(isGameCreator);

        // Check if user is a player in this game
        const { data: playerData, error: playerError } = await supabase
          .from('game_players')
          .select('*')
          .eq('game_id', gameId)
          .eq('player_id', user.id);

        if (playerError) throw playerError;
        
        const isPlayerInGame = playerData && playerData.length > 0;
        setIsPlayer(isPlayerInGame);

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
        setCreatorProfile(null);
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
    creatorProfile,
    loading 
  };
}
