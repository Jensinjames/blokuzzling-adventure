
import { toast } from 'sonner';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { 
  validatePiecePlacement, 
  hasValidMoves, 
  BOARD_SIZE, 
  collectPowerup, 
  useDestroyPowerup 
} from '@/utils/gameUtils';

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
      const updatedGameState = useDestroyPowerup(gameState, position);
      
      if (updatedGameState !== gameState) {
        setGameState(updatedGameState);
        toast.success("Block destroyed!");
      } else {
        toast.error("Cannot use powerup on this cell");
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
    
    const newBoard = [...gameState.board.map(row => [...row])];
    let updatedGameState = { ...gameState, board: newBoard };
    let powerupCollected = false;
    
    for (let i = 0; i < selectedPiece.shape.length; i++) {
      for (let j = 0; j < selectedPiece.shape[i].length; j++) {
        if (selectedPiece.shape[i][j] === 1) {
          const boardRow = position.row + i;
          const boardCol = position.col + j;
          
          // Check if we're placing on a powerup cell
          if (newBoard[boardRow][boardCol].hasPowerup) {
            powerupCollected = true;
          }
          
          newBoard[boardRow][boardCol] = {
            player: gameState.currentPlayer,
            pieceId: selectedPiece.id
          };
        }
      }
    }
    
    // Check if a powerup was collected and update game state
    if (powerupCollected) {
      updatedGameState = collectPowerup(updatedGameState, position);
      toast.success("Powerup collected!");
    }
    
    const updatedPlayers = [...updatedGameState.players];
    const currentPlayerIndex = updatedGameState.currentPlayer;
    
    updatedPlayers[currentPlayerIndex].pieces = updatedPlayers[currentPlayerIndex].pieces.map(
      piece => piece.id === selectedPiece.id ? { ...piece, used: true } : piece
    );
    
    updatedPlayers[currentPlayerIndex].moveHistory.push({
      type: 'place',
      piece: selectedPiece.id,
      position,
      timestamp: Date.now()
    });
    
    const turnHistoryItem = {
      type: 'place',
      player: currentPlayerIndex,
      piece: selectedPiece.id,
      position,
      timestamp: Date.now()
    };
    
    let nextPlayer = (currentPlayerIndex + 1) % updatedPlayers.length;
    let attempts = 0;
    
    while (!hasValidMoves(updatedGameState, nextPlayer) && nextPlayer !== currentPlayerIndex) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
      
      if (attempts >= updatedPlayers.length) {
        break;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      board: updatedGameState.board,
      players: updatedPlayers,
      currentPlayer: nextPlayer,
      turnHistory: [...prev.turnHistory, turnHistoryItem],
      gameStats: {
        ...prev.gameStats,
        totalMoves: prev.gameStats.totalMoves + 1,
        lastMoveTime: Date.now()
      }
    }));
    
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  const handleUndo = () => {
    if (gameState.turnHistory.length === 0) {
      toast.error("No moves to undo!");
      return;
    }
    
    const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
    const newTurnHistory = gameState.turnHistory.slice(0, -1);
    
    if (lastMove.type === 'place' && lastMove.piece) {
      const newBoard = gameState.board.map(row => [...row]);
      
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (newBoard[row][col].player === lastMove.player && 
              newBoard[row][col].pieceId === lastMove.piece) {
            // Restore powerup cells if applicable
            const isPowerupCell = gameState.powerupCells?.some(
              pos => pos.row === row && pos.col === col
            );
            
            newBoard[row][col] = isPowerupCell 
              ? { player: null, hasPowerup: true, powerupType: 'destroy' } 
              : { player: null };
          }
        }
      }
      
      const updatedPlayers = [...gameState.players];
      
      updatedPlayers[lastMove.player].pieces = updatedPlayers[lastMove.player].pieces.map(
        piece => piece.id === lastMove.piece ? { ...piece, used: false } : piece
      );
      
      updatedPlayers[lastMove.player].moveHistory = updatedPlayers[lastMove.player].moveHistory.filter(
        move => move.type !== 'place' || (move.timestamp !== lastMove.timestamp)
      );
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory,
        gameStatus: 'playing',
        winner: null
      }));
    } else if (lastMove.type === 'pass') {
      const updatedPlayers = [...gameState.players];
      
      updatedPlayers[lastMove.player].moveHistory = updatedPlayers[lastMove.player].moveHistory.filter(
        move => move.type !== 'pass' || (move.timestamp !== lastMove.timestamp)
      );
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory
      }));
    } else if (lastMove.type === 'use-powerup' && lastMove.targetPosition) {
      // Handle undoing powerup usage
      const updatedPlayers = [...gameState.players];
      const currentPlayer = updatedPlayers[lastMove.player];
      
      // Return the powerup to the player's inventory
      const powerupType = lastMove.powerupType || 'destroy';
      const existingPowerupIndex = currentPlayer.powerups?.findIndex(p => p.type === powerupType) || -1;
      
      if (existingPowerupIndex >= 0 && currentPlayer.powerups) {
        currentPlayer.powerups[existingPowerupIndex].count += 1;
      } else {
        if (!currentPlayer.powerups) {
          currentPlayer.powerups = [];
        }
        currentPlayer.powerups.push({ type: powerupType, count: 1 });
      }
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory
      }));
    }
    
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
