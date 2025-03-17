
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { toast } from 'sonner';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import PlayerInfo from '@/components/PlayerInfo';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import { ArrowLeft } from 'lucide-react';
import {
  createInitialGameState,
  validatePiecePlacement,
  rotatePiece,
  flipPiece,
  calculateScore,
  checkGameOver,
  determineWinner,
  hasValidMoves,
  BOARD_SIZE
} from '@/utils/gameUtils';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(numPlayers));
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);
  const navigate = useNavigate();

  // Initialize or reset game
  const initGame = useCallback(() => {
    setGameState(createInitialGameState(numPlayers));
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  }, [numPlayers]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Check for game over condition
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && checkGameOver(gameState)) {
      // Update player scores
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: calculateScore(player.pieces)
      }));
      
      const winner = determineWinner(updatedPlayers);
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner
      }));
      
      toast(`Game Over! ${winner !== null ? `Player ${winner + 1} wins!` : 'It\'s a tie!'}`);
    }
  }, [gameState]);

  // Update preview position and validation on mouse move
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

  // Place piece on the board
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
    
    // Place the piece on the board
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
    
    // Mark the piece as used
    const updatedPlayers = [...gameState.players];
    const currentPlayerIndex = gameState.currentPlayer;
    
    updatedPlayers[currentPlayerIndex].pieces = updatedPlayers[currentPlayerIndex].pieces.map(
      piece => piece.id === selectedPiece.id ? { ...piece, used: true } : piece
    );
    
    // Add move to history
    updatedPlayers[currentPlayerIndex].moveHistory.push({
      type: 'place',
      piece: selectedPiece.id,
      position,
      timestamp: Date.now()
    });
    
    // Add to turn history
    const turnHistoryItem = {
      type: 'place',
      player: currentPlayerIndex,
      piece: selectedPiece.id,
      position,
      timestamp: Date.now()
    };
    
    // Find next player who can make a move
    let nextPlayer = (currentPlayerIndex + 1) % updatedPlayers.length;
    let attempts = 0;
    
    // Skip players who have no valid moves
    while (!hasValidMoves(gameState, nextPlayer) && nextPlayer !== currentPlayerIndex) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
      
      if (attempts >= updatedPlayers.length) {
        // If all players have been checked and none can move, end the game
        break;
      }
    }
    
    // Update game state
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
    
    // Reset selection
    setSelectedPiece(null);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  // Handle piece selection
  const handleSelectPiece = (piece: Piece) => {
    if (piece.used) {
      toast.error("This piece has already been used!");
      return;
    }
    
    setSelectedPiece(piece);
    setPreviewPosition(null);
    setIsValidPlacement(false);
  };

  // Rotate selected piece
  const handleRotatePiece = () => {
    if (!selectedPiece) return;
    
    const rotatedShape = rotatePiece(selectedPiece);
    
    setSelectedPiece({
      ...selectedPiece,
      shape: rotatedShape
    });
    
    // Re-check placement validity if there's a preview position
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

  // Flip selected piece
  const handleFlipPiece = () => {
    if (!selectedPiece) return;
    
    const flippedShape = flipPiece(selectedPiece);
    
    setSelectedPiece({
      ...selectedPiece,
      shape: flippedShape
    });
    
    // Re-check placement validity if there's a preview position
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

  // Pass turn
  const handlePassTurn = () => {
    if (!hasValidMoves(gameState, gameState.currentPlayer)) {
      toast("No valid moves available, passing turn");
    }
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayer].moveHistory.push({
      type: 'pass',
      timestamp: Date.now()
    });
    
    // Add to turn history
    const turnHistoryItem = {
      type: 'pass',
      player: gameState.currentPlayer,
      timestamp: Date.now()
    };
    
    // Find next player
    let nextPlayer = (gameState.currentPlayer + 1) % updatedPlayers.length;
    let attempts = 0;
    
    // Skip players who have no valid moves
    while (!hasValidMoves(gameState, nextPlayer) && nextPlayer !== gameState.currentPlayer) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
      
      if (attempts >= updatedPlayers.length) {
        // If all players have been checked and none can move, end the game
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

  // Undo last move
  const handleUndo = () => {
    if (gameState.turnHistory.length === 0) {
      toast.error("No moves to undo!");
      return;
    }
    
    const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
    const newTurnHistory = gameState.turnHistory.slice(0, -1);
    
    if (lastMove.type === 'place' && lastMove.piece) {
      // Undo piece placement
      const newBoard = gameState.board.map(row => [...row]);
      
      // Remove the piece from the board
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (newBoard[row][col].player === lastMove.player && 
              newBoard[row][col].pieceId === lastMove.piece) {
            newBoard[row][col] = { player: null };
          }
        }
      }
      
      // Mark the piece as unused
      const updatedPlayers = [...gameState.players];
      
      updatedPlayers[lastMove.player].pieces = updatedPlayers[lastMove.player].pieces.map(
        piece => piece.id === lastMove.piece ? { ...piece, used: false } : piece
      );
      
      // Remove move from history
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
      // Undo pass turn
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

  // Navigate back to home
  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-4">
          <button 
            onClick={handleHome}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-xl font-bold text-center">Multiplayer Game</h1>
          <div className="w-6"></div> {/* Spacer for balance */}
        </header>
        
        <PlayerInfo
          players={gameState.players}
          currentPlayer={gameState.currentPlayer}
        />
        
        <GameBoard
          gameState={gameState}
          size={BOARD_SIZE}
          onCellClick={handleCellClick}
          selectedPiecePreview={selectedPiece}
          previewPosition={previewPosition}
          isValidPlacement={isValidPlacement}
        />
        
        {gameState.gameStatus === 'finished' ? (
          <GameResult
            players={gameState.players}
            winner={gameState.winner}
            onRestart={initGame}
            onHome={handleHome}
          />
        ) : (
          <>
            <div className="text-center text-sm text-gray-600 mb-3">
              Select a piece from your inventory
            </div>
            
            <PieceSelector
              pieces={gameState.players[gameState.currentPlayer].pieces}
              currentPlayer={gameState.currentPlayer}
              onSelectPiece={handleSelectPiece}
              onRotatePiece={handleRotatePiece}
              onFlipPiece={handleFlipPiece}
              selectedPiece={selectedPiece}
            />
            
            <div className="mt-4">
              <GameControls
                onUndo={handleUndo}
                onReset={initGame}
                onPass={handlePassTurn}
                onHome={handleHome}
                canUndo={gameState.turnHistory.length > 0}
                isGameOver={gameState.gameStatus === 'finished'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
