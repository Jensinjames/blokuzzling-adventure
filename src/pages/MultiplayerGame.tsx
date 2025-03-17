
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useAuth } from '@/hooks/useAuth';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import PlayerInfo from '@/components/PlayerInfo';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Piece, BoardPosition, GameState } from '@/types/game';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { Button } from '@/components/ui/button';

const MultiplayerGame = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);
  const [isPowerupActive, setIsPowerupActive] = useState<boolean>(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);
  
  const {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState
  } = useMultiplayerGame(id || '');

  const {
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handlePassTurn
  } = usePieceActions(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    async (newState: GameState) => {
      if (gameState) {
        setGameState(newState);
        if (isMyTurn) {
          await updateGameState(newState);
        }
      }
      return true;
    },
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    setIsValidPlacement
  );

  const {
    handleCellClick,
    handleUndo,
    handleUsePowerup
  } = useBoardActions(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    async (newState: GameState) => {
      if (gameState) {
        setGameState(newState);
        if (isMyTurn) {
          await updateGameState(newState);
        }
      }
      return true;
    },
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement,
    isPowerupActive,
    setIsPowerupActive
  );

  useEffect(() => {
    if (!isMyTurn) {
      setSelectedPiece(null);
      setPreviewPosition(null);
      setIsValidPlacement(false);
      setIsPowerupActive(false);
      setActivePowerupType(null);
    }
  }, [isMyTurn]);

  const handleHome = () => {
    navigate('/home');
  };

  const handleReset = () => {
    // Only show toast in multiplayer
    toast.info('Game reset is not available in multiplayer mode');
  };

  const handleBoardCellClick = (position: BoardPosition) => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    handleCellClick(position);
  };

  // Handler for using powerup from player info card
  const handlePlayerUsePowerup = (playerId: number, powerupType: string) => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    
    if (playerId !== gameState?.currentPlayer) {
      toast.error("You can only use your own powerups during your turn");
      return;
    }
    
    if (isPowerupActive) {
      setIsPowerupActive(false);
      setActivePowerupType(null);
      toast.info("Powerup mode cancelled");
    } else {
      setActivePowerupType(powerupType);
      handleUsePowerup(powerupType);
    }
  };

  const cancelPowerupMode = () => {
    setIsPowerupActive(false);
    setActivePowerupType(null);
    toast.info("Powerup mode cancelled");
  };

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-4">
          <button 
            onClick={handleHome}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-xl font-bold text-center dark:text-white">Multiplayer Game</h1>
          <div className="w-6"></div>
        </header>
        
        <PlayerInfo
          players={gameState.players}
          currentPlayer={gameState.currentPlayer}
          onUsePowerup={handlePlayerUsePowerup}
          isViewerCurrentPlayer={isMyTurn}
        />
        
        {isPowerupActive && isMyTurn && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
              onClick={cancelPowerupMode}
            >
              Cancel {activePowerupType} Powerup
            </Button>
          </div>
        )}
        
        <GameBoard
          gameState={gameState}
          size={BOARD_SIZE}
          onCellClick={handleBoardCellClick}
          selectedPiecePreview={isPowerupActive ? null : selectedPiece}
          previewPosition={previewPosition}
          isValidPlacement={isValidPlacement && isMyTurn}
          onCellHover={handleCellHover}
          isPowerupActive={isPowerupActive}
        />
        
        {gameState.gameStatus === "finished" || gameState.gameStatus === "completed" ? (
          <GameResult
            players={gameState.players}
            winner={gameState.winner}
            onRestart={handleReset}
            onHome={handleHome}
          />
        ) : (
          <>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isMyTurn 
                ? (isPowerupActive 
                    ? `Select a block to use ${activePowerupType} powerup` 
                    : "Your turn - Select a piece from your inventory")
                : `Waiting for ${gameState.players[gameState.currentPlayer]?.name || 'opponent'} to make a move...`}
            </div>
            
            {isMyTurn && !isPowerupActive && (
              <PieceSelector
                pieces={gameState.players[playerNumber || 0]?.pieces || []}
                currentPlayer={playerNumber || 0}
                onSelectPiece={handleSelectPiece}
                onRotatePiece={handleRotatePiece}
                onFlipPiece={handleFlipPiece}
                selectedPiece={selectedPiece}
              />
            )}
            
            <div className="mt-4">
              <GameControls
                onUndo={handleUndo}
                onReset={handleReset}
                onPass={isMyTurn ? handlePassTurn : () => toast.info("It's not your turn")}
                onHome={handleHome}
                canUndo={isMyTurn && gameState.turnHistory.length > 0}
                isGameOver={["finished", "completed"].includes(gameState.gameStatus)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;
