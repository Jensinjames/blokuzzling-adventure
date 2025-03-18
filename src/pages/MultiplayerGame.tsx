
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import MultiplayerGameContainer from '@/components/multiplayer/MultiplayerGameContainer';
import { useMultiplayerPieceState } from '@/hooks/useMultiplayerPieceState';
import { useMultiplayerPowerups } from '@/hooks/useMultiplayerPowerups';

const MultiplayerGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, session, refreshSession } = useAuth();
  
  // Check for valid gameId and authentication
  useEffect(() => {
    if (!gameId) {
      toast.error('No game ID provided');
      navigate('/home');
      return;
    }

    if (!user || !session) {
      toast.error('You must be logged in to play multiplayer games');
      navigate('/auth');
    }
  }, [gameId, user, session, navigate]);

  // Ensure session is refreshed when needed
  useEffect(() => {
    if (session && new Date(session.expires_at * 1000) < new Date(Date.now() + 5 * 60 * 1000)) {
      console.log('Session expiring soon, refreshing...');
      refreshSession();
    }
  }, [session, refreshSession]);
  
  const {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState
  } = useMultiplayerGame(gameId || '');

  // Initialize piece state
  const {
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement
  } = useMultiplayerPieceState(isMyTurn);

  // Initialize powerup state
  const {
    isPowerupActive,
    setIsPowerupActive,
    activePowerupType,
    setActivePowerupType,
    handlePlayerUsePowerup,
    cancelPowerupMode
  } = useMultiplayerPowerups(isMyTurn);

  const handleSetGameState = (newState: any) => {
    setGameState(newState);
    if (isMyTurn) {
      updateGameState(newState);
    }
    return true;
  };

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
    handleSetGameState,
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
    handleSetGameState,
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement,
    isPowerupActive,
    setIsPowerupActive
  );

  const handleHome = () => {
    navigate('/home');
  };

  const handleReset = () => {
    toast.info('Game reset is not available in multiplayer mode');
  };

  const handlePlayerUsePowerupWithGameState = (playerId: number, powerupType: string) => {
    if (gameState) {
      handlePlayerUsePowerup(playerId, gameState.currentPlayer, powerupType);
      
      if (!isPowerupActive) {
        handleUsePowerup(powerupType);
      }
    }
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
    <MultiplayerGameContainer
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
      onUsePowerup={handlePlayerUsePowerupWithGameState}
      cancelPowerupMode={cancelPowerupMode}
    />
  );
};

export default MultiplayerGame;
