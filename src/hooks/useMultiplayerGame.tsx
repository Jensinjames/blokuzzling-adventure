
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession, GamePlayer, Profile } from '@/types/database';
import { toast } from 'sonner';
import { GameState, BoardPosition, Piece, TurnHistoryItem, Move } from '@/types/game';
import { createInitialGameState } from '@/utils/gameUtils';

export function useMultiplayerGame(gameId: string) {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Load game data
  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch game session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', gameId)
          .single();

        if (sessionError) throw sessionError;

        // Fetch players with profiles
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('game_id', gameId)
          .order('player_number', { ascending: true });

        if (playersError) throw playersError;

        setGameSession(sessionData as GameSession);
        setPlayers(playersData as any);

        // Find current player's number
        const currentPlayer = playersData.find((p: GamePlayer) => p.player_id === user.id);
        if (currentPlayer) {
          setPlayerNumber(currentPlayer.player_number);
        }

        // Initialize or load game state
        if (sessionData.game_state && Object.keys(sessionData.game_state).length === 0) {
          // New game, initialize state
          const initialState = createInitialGameState(playersData.length);
          
          // Update player names and colors
          const updatedPlayers = initialState.players.map((p, idx) => {
            const playerData = playersData.find((pd: any) => pd.player_number === idx);
            if (playerData) {
              return {
                ...p,
                name: playerData.profile.username,
                id: idx
              };
            }
            return p;
          });

          const newGameState = {
            ...initialState,
            players: updatedPlayers
          };

          setGameState(newGameState);
          
          // Save initial state to database - need to handle JSON serialization
          await supabase
            .from('game_sessions')
            .update({
              game_state: newGameState as any
            })
            .eq('id', gameId);
        } else {
          // Load existing game state
          const loadedState = sessionData.game_state as unknown as GameState;
          setGameState(loadedState);
        }

      } catch (error) {
        console.error('Error fetching game data:', error);
        toast.error('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();

    // Subscribe to game state changes
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
          setGameSession(payload.new as GameSession);
          setGameState(payload.new.game_state as unknown as GameState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, user]);

  // Check if it's the current player's turn
  useEffect(() => {
    if (gameState && playerNumber !== null) {
      setIsMyTurn(gameState.currentPlayer === playerNumber);
    }
  }, [gameState, playerNumber]);

  // Update game state
  const updateGameState = async (newState: GameState) => {
    if (!user || !gameId || playerNumber === null || !isMyTurn) {
      return false;
    }

    try {
      await supabase
        .from('game_sessions')
        .update({
          game_state: newState as any,
          turn_history: [...(gameSession?.turn_history || []), {
            player: playerNumber,
            timestamp: Date.now(),
            action: 'move'
          }] as any
        })
        .eq('id', gameId);

      setGameState(newState);
      return true;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
      return false;
    }
  };

  // Make a move
  const makeMove = async (type: 'place' | 'pass', piece?: string, position?: BoardPosition) => {
    if (!user || !gameId || playerNumber === null || !isMyTurn || !gameState) {
      return false;
    }

    try {
      // Create a new move
      const move: Move = {
        type,
        piece,
        position,
        timestamp: Date.now()
      };

      // Add to history
      const historyItem: TurnHistoryItem = {
        type,
        player: playerNumber,
        piece,
        position,
        timestamp: Date.now()
      };

      // Update player's move history
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerNumber].moveHistory.push(move);

      // Update game state
      const updatedGameState = {
        ...gameState,
        players: updatedPlayers,
        turnHistory: [...gameState.turnHistory, historyItem],
        currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length
      };

      await updateGameState(updatedGameState);
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }
  };

  // End the game
  const endGame = async (winnerId: number | null) => {
    if (!user || !gameId || !gameState) {
      return false;
    }

    try {
      // Get winner profile ID
      let winnerProfileId = null;
      if (winnerId !== null) {
        const winnerPlayer = players.find(p => p.player_number === winnerId);
        if (winnerPlayer) {
          winnerProfileId = winnerPlayer.player_id;
        }
      }

      // Update game session status
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: winnerProfileId,
          game_state: {
            ...gameState,
            gameStatus: 'finished',
            winner: winnerId
          }
        })
        .eq('id', gameId);

      // Update player stats
      if (winnerId !== null) {
        for (const player of players) {
          if (player.player_number === winnerId) {
            // Winner
            await supabase
              .from('profiles')
              .update({
                wins: player.profile.wins + 1
              })
              .eq('id', player.player_id);
          } else {
            // Loser
            await supabase
              .from('profiles')
              .update({
                losses: player.profile.losses + 1
              })
              .eq('id', player.player_id);
          }
        }
      } else {
        // Draw
        for (const player of players) {
          await supabase
            .from('profiles')
            .update({
              draws: player.profile.draws + 1
            })
            .eq('id', player.player_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Failed to end game');
      return false;
    }
  };

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState,
    makeMove,
    endGame
  };
}
