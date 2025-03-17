import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import PlayerInfo from '@/components/PlayerInfo';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const navigate = useNavigate();
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  
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

  const handleHome = () => {
    navigate('/');
  };

  const renderPowerups = () => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const destroyPowerup = currentPlayer.powerups?.find(p => p.type === 'destroy');
    
    if (!destroyPowerup || destroyPowerup.count <= 0) return null;
    
    return (
      <div className="flex justify-center mb-4">
        <Button 
          variant={isPowerupActive ? "destructive" : "outline"}
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            if (isPowerupActive) {
              setIsPowerupActive(false);
              toast.info("Powerup mode cancelled");
            } else {
              handleUsePowerup('destroy');
            }
          }}
        >
          <Wand2 className="h-4 w-4" />
          {isPowerupActive ? "Cancel" : `Use Destroy Powerup (${destroyPowerup.count})`}
        </Button>
      </div>
    );
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
          <h1 className="text-xl font-bold text-center dark:text-white">Multiplayer Game</h1>
          <div className="w-6"></div>
        </header>
        
        <PlayerInfo
          players={gameState.players}
          currentPlayer={gameState.currentPlayer}
        />
        
        {renderPowerups()}
        
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
        
        {gameState?.gameStatus === "finished" || gameState?.gameStatus === "completed" ? (
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
                ? "Select a block to destroy" 
                : "Select a piece from your inventory"}
            </div>
            
            {!isPowerupActive && (
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
                isGameOver={gameState.gameStatus === "finished" || gameState.gameStatus === "completed"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
