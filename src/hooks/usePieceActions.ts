
import { BoardPosition, Piece, GameState, TurnHistoryItem } from '@/types/game';
import { toast } from 'sonner';
import {
  validatePiecePlacement,
  rotatePiece,
  flipPiece,
  hasValidMoves,
} from '@/utils/gameUtils';

export function usePieceActions(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  selectedPiece: Piece | null,
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>,
  previewPosition: BoardPosition | null,
  setPreviewPosition: React.Dispatch<React.SetStateAction<BoardPosition | null>>,
  setIsValidPlacement: React.Dispatch<React.SetStateAction<boolean>>
) {
  const handleCellHover = (position: BoardPosition) => {
    if (selectedPiece) {
      setPreviewPosition(position);
      const isValid = validatePiecePlacement(
        selectedPiece,
        position,
        gameState.board,
        gameState.currentPlayer
      );
      setIsValidPlacement(isValid);
    }
  };

  const handleSelectPiece = (piece: Piece) => {
    if (piece.used) {
      toast.error("This piece has already been used!");
      return;
    }
    
    setSelectedPiece(piece);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  const handleRotatePiece = () => {
    if (!selectedPiece) return;
    
    const rotatedShape = rotatePiece(selectedPiece);
    
    setSelectedPiece({
      ...selectedPiece,
      shape: rotatedShape
    });
    
    if (previewPosition) {
      const updatedPiece = {
        ...selectedPiece,
        shape: rotatedShape
      };
      
      const isValid = validatePiecePlacement(
        updatedPiece,
        previewPosition,
        gameState.board,
        gameState.currentPlayer
      );
      
      setIsValidPlacement(isValid);
    }
  };

  const handleFlipPiece = () => {
    if (!selectedPiece) return;
    
    const flippedShape = flipPiece(selectedPiece);
    
    setSelectedPiece({
      ...selectedPiece,
      shape: flippedShape
    });
    
    if (previewPosition) {
      const updatedPiece = {
        ...selectedPiece,
        shape: flippedShape
      };
      
      const isValid = validatePiecePlacement(
        updatedPiece,
        previewPosition,
        gameState.board,
        gameState.currentPlayer
      );
      
      setIsValidPlacement(isValid);
    }
  };

  const handlePassTurn = () => {
    if (!hasValidMoves(gameState, gameState.currentPlayer)) {
      toast("No valid moves available, passing turn");
    }
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayer].moveHistory.push({
      type: 'pass',
      timestamp: Date.now()
    });
    
    // Create a turn history item with the correct type
    const turnHistoryItem: TurnHistoryItem = {
      type: 'pass',
      player: gameState.currentPlayer,
      timestamp: Date.now()
    };
    
    let nextPlayer = (gameState.currentPlayer + 1) % updatedPlayers.length;
    let attempts = 0;
    
    while (!hasValidMoves(gameState, nextPlayer) && nextPlayer !== gameState.currentPlayer) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
      
      if (attempts >= updatedPlayers.length) {
        break;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      players: updatedPlayers,
      turnHistory: [...prev.turnHistory, turnHistoryItem]
    }));
    
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  return {
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handlePassTurn
  };
}
