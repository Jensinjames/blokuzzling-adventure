
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import PlayerInfo from '@/components/PlayerInfo';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import AIDifficultySelector from '@/components/AIDifficultySelector';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const navigate = useNavigate();
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  
  const {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame
  } = useGameState(numPlayers);

  const {
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handlePassTurn
  } = usePieceActions(
    gameState,
    setGameState,
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
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement,
    isPowerupActive,
    setIsPowerupActive
  );

  // AI Player hooks (only for player 1 in a 2-player game)
  const {
    isAIThinking
  } = useAIPlayer(
    gameState,
    setGameState,
    1, // AI is always player 2 (index 1)
    aiDifficulty,
    gameStarted && numPlayers === 2 // Only enable AI in 2-player games
  );

  const handleHome = () => {
    navigate('/');
  };

  // Start the game with the selected settings
  const handleStartGame = () => {
    // Reset the game with current settings
    initGame();
    setGameStarted(true);
    toast.success(`Game started with ${aiDifficulty} AI difficulty`);
  };

  // Handle AI difficulty selection
  const handleSelectDifficulty = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
  };

  // Handler for using powerup from player info card
  const handlePlayerUsePowerup = (playerId: number, powerupType: string) => {
    if (playerId !== gameState.currentPlayer) {
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

  // Helper function to check if game is over
  const isGameOver = (): boolean => {
    return gameState.gameStatus === "finished" || gameState.gameStatus === "completed";
  };

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
          <h1 className="text-xl font-bold text-center dark:text-white">
            {gameStarted ? "Single Player Game" : "Game Setup"}
          </h1>
          <div className="w-6"></div>
        </header>
        
        {!gameStarted ? (
          <div className="glass-panel p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Choose AI Difficulty</h2>
            
            <AIDifficultySelector 
              difficulty={aiDifficulty} 
              onSelectDifficulty={handleSelectDifficulty}
              className="mb-6"
            />
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStartGame}
            >
              Start Game
            </Button>
          </div>
        ) : (
          <>
            <PlayerInfo
              players={gameState.players}
              currentPlayer={gameState.currentPlayer}
              onUsePowerup={handlePlayerUsePowerup}
            />
            
            {isAIThinking && gameState.currentPlayer === 1 && (
              <div className="text-center py-2 mb-2 text-sm bg-amber-100 dark:bg-amber-900 rounded-md">
                AI is thinking...
              </div>
            )}
            
            {isPowerupActive && (
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
              onCellClick={handleCellClick}
              selectedPiecePreview={isPowerupActive ? null : selectedPiece}
              previewPosition={previewPosition}
              isValidPlacement={isValidPlacement}
              onCellHover={handleCellHover}
              isPowerupActive={isPowerupActive}
            />
            
            {isGameOver() ? (
              <GameResult
                players={gameState.players}
                winner={gameState.winner}
                onRestart={initGame}
                onHome={handleHome}
              />
            ) : (
              <>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {isPowerupActive 
                    ? `Select a block to use ${activePowerupType} powerup` 
                    : "Select a piece from your inventory"}
                </div>
                
                {!isPowerupActive && gameState.currentPlayer === 0 && (
                  <PieceSelector
                    pieces={gameState.players[gameState.currentPlayer].pieces}
                    currentPlayer={gameState.currentPlayer}
                    onSelectPiece={handleSelectPiece}
                    onRotatePiece={handleRotatePiece}
                    onFlipPiece={handleFlipPiece}
                    selectedPiece={selectedPiece}
                  />
                )}
                
                <div className="mt-4">
                  <GameControls
                    onUndo={handleUndo}
                    onReset={initGame}
                    onPass={handlePassTurn}
                    onHome={handleHome}
                    canUndo={gameState.turnHistory.length > 0}
                    isGameOver={isGameOver()}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
