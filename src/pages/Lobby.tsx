
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
import { AIDifficulty } from '@/utils/ai/aiTypes';

// Import our components
import LobbyHeader from '@/components/lobby/LobbyHeader';
import LobbyInfo from '@/components/lobby/LobbyInfo';
import PlayerList from '@/components/lobby/PlayerList';
import InviteForm from '@/components/lobby/InviteForm';
import AIPlayersToggle from '@/components/lobby/AIPlayersToggle';
import { useMultiplayerAI } from '@/hooks/useMultiplayerAI';

const Lobby = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startGameSession } = useMultiplayer();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [starting, setStarting] = useState(false);

  // AI players management
  const {
    aiEnabled,
    aiCount,
    aiDifficulty,
    maxAIPlayers,
    setAiEnabled,
    setAiCount,
    setAiDifficulty
  } = useMultiplayerAI(
    gameSession?.max_players || 4, 
    players.length
  );

  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch game session
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', gameId)
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
          .eq('game_id', gameId)
          .order('player_number', { ascending: true });

        if (playersError) throw playersError;
        if (!playersData) throw new Error("No players found");

        // Safely cast the players data
        const typedPlayers = safeDataCast<GamePlayer & { profile: Profile }>(playersData);
        setPlayers(typedPlayers);

        // If game is already active, redirect to game
        if (typedSession.status === 'active') {
          navigate(`/multiplayer/${gameId}`);
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
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          if (payload.new) {
            const updatedSession = payload.new as unknown as GameSession;
            setGameSession(updatedSession);
            
            // If game becomes active, redirect to game
            if (updatedSession.status === 'active') {
              navigate(`/multiplayer/${gameId}`);
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
          filter: `game_id=eq.${gameId}`
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
  }, [gameId, user, navigate]);

  const handleStartGame = async () => {
    if (!gameId) return;
    setStarting(true);
    
    try {
      // First update AI player settings if enabled
      if (aiEnabled && aiCount > 0) {
        const { error } = await supabase
          .from('game_sessions')
          .update({
            ai_enabled: aiEnabled,
            ai_count: aiCount,
            ai_difficulty: aiDifficulty
          })
          .eq('id', gameId);
          
        if (error) throw error;
      }
      
      // Then start the game
      await startGameSession(gameId);
    } catch (error: any) {
      toast.error(`Failed to start game: ${error.message}`);
    } finally {
      setStarting(false);
    }
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

  // Calculate if we can start the game (either enough human players or AI enabled)
  const canStartGame = isCreator && 
    (players.length >= 2 || (players.length >= 1 && aiEnabled && aiCount > 0)) && 
    gameSession?.status === 'waiting';

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

            {isCreator && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
              >
                <AIPlayersToggle
                  aiEnabled={aiEnabled}
                  aiCount={aiCount}
                  aiDifficulty={aiDifficulty}
                  maxAIPlayers={maxAIPlayers}
                  onToggleAI={setAiEnabled}
                  onChangeAICount={setAiCount}
                  onChangeDifficulty={setAiDifficulty}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel"
            >
              <InviteForm gameId={gameId || ''} userId={user?.id} />
            </motion.div>

            <div className="flex justify-center mt-6">
              <Button
                size="lg"
                onClick={handleStartGame}
                disabled={!canStartGame || starting}
                className="w-full max-w-xs"
              >
                {starting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
                {isCreator 
                  ? (starting ? 'Starting Game...' : 'Start Game') 
                  : 'Waiting for host to start...'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
