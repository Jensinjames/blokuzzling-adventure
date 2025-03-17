
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerInfo from '@/components/PlayerInfo';
import GameHeader from '@/components/game/GameHeader';
import GameSetup from '@/components/game/GameSetup';
import GamePlayArea from '@/components/game/GamePlayArea';
import { useGameController } from '@/hooks/useGameController';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const navigate = useNavigate();
  const {
    gameState,
    selectedPiece,
    previewPosition,
    isValidPlacement,
    isPowerupActive,
    activePowerupType,
    isAIThinking,
    gameStarted,
    aiDifficulty,
    handleCellClick,
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handleUndo,
    handlePassTurn,
    handleStartGame,
    handleSelectDifficulty,
    handlePlayerUsePowerup,
    cancelPowerupMode,
    isGameOver,
    initGame
  } = useGameController(numPlayers);

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <GameHeader 
          title={gameStarted ? "Single Player Game" : "Game Setup"}
          onBack={handleHome}
        />
        
        {!gameStarted ? (
          <GameSetup 
            aiDifficulty={aiDifficulty}
            onSelectDifficulty={handleSelectDifficulty}
            onStartGame={handleStartGame}
          />
        ) : (
          <>
            <PlayerInfo
              players={gameState.players}
              currentPlayer={gameState.currentPlayer}
              onUsePowerup={handlePlayerUsePowerup}
            />
            
            <GamePlayArea 
              gameState={gameState}
              selectedPiece={selectedPiece}
              previewPosition={previewPosition}
              isValidPlacement={isValidPlacement}
              isPowerupActive={isPowerupActive}
              activePowerupType={activePowerupType}
              isAIThinking={isAIThinking}
              isGameOver={isGameOver()}
              onCellClick={handleCellClick}
              onCellHover={handleCellHover}
              onSelectPiece={handleSelectPiece}
              onRotatePiece={handleRotatePiece}
              onFlipPiece={handleFlipPiece}
              onUndo={handleUndo}
              onReset={initGame}
              onPass={handlePassTurn}
              onHome={handleHome}
              cancelPowerupMode={cancelPowerupMode}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
