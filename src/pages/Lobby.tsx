
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { supabase, safeSingleDataCast, safeDataCast } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { GamePlayer, GameSession, Profile } from '@/types/database';
import { motion } from 'framer-motion';

// Import our new components
import LobbyHeader from '@/components/lobby/LobbyHeader';
import LobbyInfo from '@/components/lobby/LobbyInfo';
import PlayerList from '@/components/lobby/PlayerList';
import InviteForm from '@/components/lobby/InviteForm';

const Lobby = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startGameSession } = useMultiplayer();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch game session
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', id)
          .single();

        if (sessionError) throw sessionError;
        if (!session) throw new Error("Game session not found");

        // Safely cast the session data
        const typedSession = safeSingleDataCast<GameSession>(session);
        setGameSession(typedSession);
        setIsCreator(typedSession.creator_id === user.id);

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('game_id', id)
          .order('player_number', { ascending: true });

        if (playersError) throw playersError;
        if (!playersData) throw new Error("No players found");

        // Safely cast the players data
        const typedPlayers = safeDataCast<GamePlayer & { profile: Profile }>(playersData);
        setPlayers(typedPlayers);

        // If game is already active, redirect to game
        if (typedSession.status === 'active') {
          navigate(`/multiplayer/${id}`);
        } else if (typedSession.status === 'completed') {
          toast.error('This game has already been completed');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching lobby data:', error);
        toast.error('Failed to load lobby data');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();

    // Subscribe to game session changes
    const gameChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${id}`
        },
        (payload) => {
          if (payload.new) {
            const updatedSession = payload.new as unknown as GameSession;
            setGameSession(updatedSession);
            
            // If game becomes active, redirect to game
            if (updatedSession.status === 'active') {
              navigate(`/multiplayer/${id}`);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to players changes
    const playersChannel = supabase
      .channel('schema-db-players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${id}`
        },
        () => {
          // Refetch players when there are changes
          fetchGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [id, user, navigate]);

  const handleStartGame = async () => {
    if (!id) return;
    await startGameSession(id);
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <LobbyHeader onBack={handleBack} />

        {gameSession && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
            >
              <LobbyInfo gameSession={gameSession} />
              <PlayerList 
                players={players} 
                maxPlayers={gameSession.max_players} 
                creatorId={gameSession.creator_id} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel"
            >
              <InviteForm gameId={id || ''} userId={user?.id} />
            </motion.div>

            <div className="flex justify-center mt-6">
              <Button
                size="lg"
                onClick={handleStartGame}
                disabled={!isCreator || players.length < 2 || gameSession.status !== 'waiting'}
                className="w-full max-w-xs"
              >
                <Play className="h-5 w-5 mr-2" />
                {isCreator ? 'Start Game' : 'Waiting for host to start...'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
