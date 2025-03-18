
import { useAuth } from '@/context/AuthProvider';
import { GameState, TurnHistoryItem, Move } from '@/types/game';
import { toast } from 'sonner';

export function useMoveActions(
  gameId: string,
  gameState: GameState | null,
  playerNumber: number | null,
  isMyTurn: boolean,
  updateGameState: (newState: GameState, gameState: GameState | null) => Promise<boolean>
) {
  const { user } = useAuth();

  // Make a move
  const makeMove = async (type: 'place' | 'pass', piece?: string, position?: any) => {
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

      await updateGameState(updatedGameState, gameState);
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }
  };

  return { makeMove };
}
