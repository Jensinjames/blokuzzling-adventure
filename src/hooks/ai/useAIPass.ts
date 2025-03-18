
import { GameState, TurnHistoryItem } from '@/types/game';
import { useAIGameLogic } from './useAIGameLogic';

export function useAIPass() {
  const { checkGameEnd } = useAIGameLogic();

  const handleAIPass = (
    gameState: GameState,
    aiPlayerIndex: number,
    humanPlayerIndex: number,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
  ) => {
    // Create a pass move in the turn history
    const turnHistoryItem: TurnHistoryItem = {
      type: 'pass',
      player: aiPlayerIndex,
      timestamp: Date.now()
    };
    
    // Check if game should end
    const { gameEnded, updatedPlayers, winner } = checkGameEnd(
      gameState, 
      humanPlayerIndex, 
      aiPlayerIndex
    );
    
    if (gameEnded && updatedPlayers) {
      // Game is over, update state accordingly
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner,
        turnHistory: [...prev.turnHistory, turnHistoryItem]
      }));
    } else {
      // Human player has moves, continue the game
      setGameState(prev => ({
        ...prev,
        currentPlayer: humanPlayerIndex,
        turnHistory: [...prev.turnHistory, turnHistoryItem]
      }));
    }
  };

  return { handleAIPass };
}
