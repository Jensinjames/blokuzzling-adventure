
import { toast } from 'sonner';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { validatePiecePlacement, hasValidMoves } from '@/utils/gameUtils';
import { handlePowerups } from '@/utils/powerupUtils';
import { placeSelectedPiece } from '@/utils/boardUtils';
import { handleUndoAction } from '@/utils/gameHistoryUtils';

export function useBoardActions(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  selectedPiece: Piece | null,
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>,
  setPreviewPosition: React.Dispatch<React.SetStateAction<BoardPosition | null>>,
  setIsValidPlacement: React.Dispatch<React.SetStateAction<boolean>>,
  isPowerupActive: boolean = false,
  setIsPowerupActive?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const handleCellClick = (position: BoardPosition) => {
    // If powerup mode is active, use the powerup
    if (isPowerupActive) {
      if (setIsPowerupActive) setIsPowerupActive(false);
      const { updatedGameState, success, message } = handlePowerups(gameState, position);
      
      if (success) {
        setGameState(updatedGameState);
        toast.success(message || "Block destroyed!");
      } else {
        toast.error(message || "Cannot use powerup on this cell");
      }
      return;
    }
    
    if (!selectedPiece) {
      toast.error("Select a piece first!");
      return;
    }
    
    if (!validatePiecePlacement(
      selectedPiece,
      position,
      gameState.board,
      gameState.currentPlayer
    )) {
      toast.error("Invalid placement!");
      return;
    }
    
    // Use placeSelectedPiece from boardUtils
    const { updatedGameState, powerupCollected } = placeSelectedPiece(
      gameState,
      selectedPiece,
      position
    );
    
    if (powerupCollected) {
      toast.success("Powerup collected!");
    }
    
    setGameState(updatedGameState);
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  const handleUndo = () => {
    if (gameState.turnHistory.length === 0) {
      toast.error("No moves to undo!");
      return;
    }
    
    const { updatedGameState } = handleUndoAction(gameState);
    
    setGameState(updatedGameState);
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
    if (setIsPowerupActive) setIsPowerupActive(false);
  };

  const handleUsePowerup = (type: string) => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const powerup = currentPlayer.powerups?.find(p => p.type === type);
    
    if (!powerup || powerup.count <= 0) {
      toast.error("You don't have this powerup!");
      return;
    }
    
    if (type === 'destroy') {
      if (setIsPowerupActive) {
        setIsPowerupActive(true);
        toast.info("Select a block to destroy");
      }
    }
  };

  return {
    handleCellClick,
    handleUndo,
    handleUsePowerup
  };
}
