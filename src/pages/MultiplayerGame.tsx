
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { toast } from 'sonner';
import { useMultiplayerGameState } from '@/hooks/useMultiplayerGameState';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import MultiplayerGameContainer from '@/components/multiplayer/MultiplayerGameContainer';
import LoadingScreen from '@/components/multiplayer/LoadingScreen';

const MultiplayerGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Authentication check
  const { isAuthenticated } = useAuthCheck({
    message: 'You must be logged in to play multiplayer games'
  });
  
  // Check for valid gameId
  useEffect(() => {
    if (!gameId) {
      toast.error('No game ID provided');
      navigate('/home');
    }
  }, [gameId, navigate]);
  
  // Initialize game session and state
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

  // Game state and actions management
  const {
    selectedPiece,
    previewPosition,
    isValidPlacement,
    isPowerupActive,
    activePowerupType,
    handleCellClick,
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handleUndo,
    handleReset,
    handlePassTurn,
    handlePlayerUsePowerupWithGameState,
    cancelPowerupMode
  } = useMultiplayerGameState(gameState, setGameState, updateGameState, isMyTurn);

  // Navigation handler
  const handleHome = () => {
    navigate('/home');
  };

  // Show loading screen while data is being fetched
  if (loading || !gameState) {
    return <LoadingScreen />;
  }

  // Render game UI
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
