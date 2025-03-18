
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { supabase, safeSingleDataCast, safeDataCast } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GamePlayer, GameSession, Profile } from '@/types/database';

// Import our components
import LobbyHeader from '@/components/lobby/LobbyHeader';
import LobbyContent from '@/components/lobby/LobbyContent';
import LobbyLoading from '@/components/lobby/LobbyLoading';
import LobbyActions from '@/components/lobby/LobbyActions';
import { useMultiplayerAI } from '@/hooks/useMultiplayerAI';
import { useGameSessionStart } from '@/hooks/useGameSessionStart';

const Lobby = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startGameSession: baseStartGameSession } = useMultiplayer();
  const { startGameSession } = useGameSessionStart(); // Use the optimized version
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
        console.log('Updating game session with AI settings:', {
          aiEnabled,
          aiCount,
          aiDifficulty
        });
        
        const { error } = await supabase
          .from('game_sessions')
          .update({
            ai_enabled: aiEnabled,
            ai_count: aiCount,
            ai_difficulty: aiDifficulty
          })
          .eq('id', gameId);
          
        if (error) {
          console.error('Error updating AI settings:', error);
          throw error;
        }
      }
      
      // Then start the game with our optimized startGameSession function
      const success = await startGameSession(gameId);
      
      if (success) {
        console.log('Game started successfully, redirecting to game');
        navigate(`/multiplayer/${gameId}`);
      }
    } catch (error: any) {
      console.error('Failed to start game:', error);
      toast.error(`Failed to start game: ${error.message}`);
    } finally {
      setStarting(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return <LobbyLoading />;
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
          <>
            <LobbyContent 
              gameSession={gameSession}
              players={players}
              isCreator={isCreator}
              userId={user?.id}
              gameId={gameId}
              aiEnabled={aiEnabled}
              aiCount={aiCount}
              aiDifficulty={aiDifficulty}
              maxAIPlayers={maxAIPlayers}
              setAiEnabled={setAiEnabled}
              setAiCount={setAiCount}
              setAiDifficulty={setAiDifficulty}
            />
            
            <LobbyActions 
              gameSession={gameSession}
              isCreator={isCreator}
              canStartGame={canStartGame}
              starting={starting}
              onStartGame={handleStartGame}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Lobby;
