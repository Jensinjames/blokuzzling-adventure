
import { toast } from 'sonner';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { validatePiecePlacement, hasValidMoves, BOARD_SIZE } from '@/utils/gameUtils';

export function useBoardActions(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  selectedPiece: Piece | null,
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>,
  setPreviewPosition: React.Dispatch<React.SetStateAction<BoardPosition | null>>,
  setIsValidPlacement: React.Dispatch<React.SetStateAction<boolean>>
) {
  const handleCellClick = (position: BoardPosition) => {
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
    
    for (let i = 0; i < selectedPiece.shape.length; i++) {
      for (let j = 0; j < selectedPiece.shape[i].length; j++) {
        if (selectedPiece.shape[i][j] === 1) {
          const boardRow = position.row + i;
          const boardCol = position.col + j;
          
          newBoard[boardRow][boardCol] = {
            player: gameState.currentPlayer,
            pieceId: selectedPiece.id
          };
        }
      }
    }
    
    const updatedPlayers = [...gameState.players];
    const currentPlayerIndex = gameState.currentPlayer;
    
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
    
    while (!hasValidMoves(gameState, nextPlayer) && nextPlayer !== currentPlayerIndex) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
      
      if (attempts >= updatedPlayers.length) {
        break;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
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
            newBoard[row][col] = { player: null };
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
    }
    
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  return {
    handleCellClick,
    handleUndo
  };
}
