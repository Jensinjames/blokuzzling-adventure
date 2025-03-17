
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Users, Send, User, Play, UserPlus, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GamePlayer, GameSession, Profile } from '@/types/database';
import { motion } from 'framer-motion';

const Lobby = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startGameSession } = useMultiplayer();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [inviting, setInviting] = useState(false);
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

        setGameSession(session as GameSession);
        setPlayers(playersData as any);
        setIsCreator(session.creator_id === user.id);

        // If game is already active, redirect to game
        if (session.status === 'active') {
          navigate(`/multiplayer/${id}`);
        } else if (session.status === 'completed') {
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
          const updatedSession = payload.new as GameSession;
          setGameSession(updatedSession);
          
          // If game becomes active, redirect to game
          if (updatedSession.status === 'active') {
            navigate(`/multiplayer/${id}`);
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

  const handleInvitePlayer = async () => {
    if (!username.trim() || !id) return;
    
    setInviting(true);
    try {
      // Find the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) {
        toast.error('User not found');
        return;
      }

      // Create invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert({
          game_id: id,
          sender_id: user?.id,
          recipient_id: userData.id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast.success(`Invite sent to ${username}`);
      setUsername('');
    } catch (error) {
      console.error('Error inviting player:', error);
      toast.error('Failed to invite player');
    } finally {
      setInviting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-xl font-bold text-center dark:text-white">Game Lobby</h1>
          <div className="w-6"></div>
        </header>

        {gameSession && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-primary">
                  <Users className="h-5 w-5 mr-2" />
                  <h2 className="font-semibold">
                    Players ({players.length}/{gameSession.max_players})
                  </h2>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Created {new Date(gameSession.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className={`bg-player${index + 1}`}>
                        {player.profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {player.profile.username}
                        {player.player_id === gameSession.creator_id && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            Host
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Player {index + 1}
                      </p>
                    </div>
                  </div>
                ))}

                {Array.from({ length: gameSession.max_players - players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center p-3 bg-gray-100/50 dark:bg-gray-700/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500">Waiting for player...</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel"
            >
              <h3 className="font-semibold flex items-center mb-3">
                <UserPlus className="h-5 w-5 mr-2 text-primary" />
                Invite Players
              </h3>

              <div className="flex space-x-2">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={inviting}
                />
                <Button
                  onClick={handleInvitePlayer}
                  disabled={!username.trim() || inviting}
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
