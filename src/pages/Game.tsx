
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import PlayerInfo from '@/components/PlayerInfo';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import { ArrowLeft } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const navigate = useNavigate();
  
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
    handleUndo
  } = useBoardActions(
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement
  );

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
          <div className="w-6"></div>
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
          onCellHover={handleCellHover}
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
