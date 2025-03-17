
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Piece, BoardPosition } from '@/types/game';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import PlayerInfo from '@/components/PlayerInfo';
import GameResult from '@/components/GameResult';
import MultiplayerHeader from '@/components/multiplayer/MultiplayerHeader';
import MultiplayerGameContent from '@/components/multiplayer/MultiplayerGameContent';

const MultiplayerGame = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    async (newState) => {
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
    async (newState) => {
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
    toast.info('Game reset is not available in multiplayer mode');
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
        <MultiplayerHeader onHome={handleHome} />
        
        <PlayerInfo
          players={gameState.players}
          currentPlayer={gameState.currentPlayer}
          onUsePowerup={handlePlayerUsePowerup}
          isViewerCurrentPlayer={isMyTurn}
        />
        
        {gameState.gameStatus === "finished" || gameState.gameStatus === "completed" ? (
          <GameResult
            players={gameState.players}
            winner={gameState.winner}
            onRestart={handleReset}
            onHome={handleHome}
          />
        ) : (
          <MultiplayerGameContent
            gameState={gameState}
            playerNumber={playerNumber}
            isMyTurn={isMyTurn}
            selectedPiece={selectedPiece}
            previewPosition={previewPosition}
            isValidPlacement={isValidPlacement}
            isPowerupActive={isPowerupActive}
            activePowerupType={activePowerupType}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            onSelectPiece={handleSelectPiece}
            onRotatePiece={handleRotatePiece}
            onFlipPiece={handleFlipPiece}
            onUndo={handleUndo}
            onReset={handleReset}
            onPass={handlePassTurn}
            onHome={handleHome}
            cancelPowerupMode={cancelPowerupMode}
          />
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;
