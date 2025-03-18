
import React from 'react';
import { GameState, BoardPosition, Piece } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';
import { Brain } from 'lucide-react';

import TurnIndicator from '@/components/multiplayer/TurnIndicator';
import PowerupActiveIndicator from '@/components/multiplayer/PowerupActiveIndicator';
import GameResult from '@/components/GameResult';
import MultiplayerGameBoard from '@/components/multiplayer/GameBoard';
import MultiplayerGameControls from '@/components/multiplayer/GameControls';
import PieceSelectorWrapper from '@/components/multiplayer/PieceSelectorWrapper';
import PlayerInfoWrapper from '@/components/multiplayer/PlayerInfoWrapper';

interface MultiplayerGameContentProps {
  gameState: GameState;
  playerNumber: number | null;
  isMyTurn: boolean;
  selectedPiece: Piece | null;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
  isPowerupActive: boolean;
  activePowerupType: string | null;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  onSelectPiece: (piece: Piece) => void;
  onRotatePiece: () => void;
  onFlipPiece: () => void;
  onUndo: () => void;
  onReset: () => void;
  onPass: () => void;
  onHome: () => void;
  cancelPowerupMode: () => void;
  onUsePowerup?: (playerId: number, powerupType: string) => void;
}

const MultiplayerGameContent: React.FC<MultiplayerGameContentProps> = ({
  gameState,
  playerNumber,
  isMyTurn,
  selectedPiece,
  previewPosition,
  isValidPlacement,
  isPowerupActive,
  activePowerupType,
  onCellClick,
  onCellHover,
  onSelectPiece,
  onRotatePiece,
  onFlipPiece,
  onUndo,
  onReset,
  onPass,
  onHome,
  cancelPowerupMode,
  onUsePowerup
}) => {
  const isMobile = useIsMobile();
  
  // Render AI indicator if current player is AI
  const renderAIIndicator = () => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) {
      return (
        <div className="fixed top-20 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-md shadow-md flex items-center z-10">
          <Brain className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">AI is thinking...</span>
        </div>
      );
    }
    return null;
  };
  
  // Show game result if the game is over
  if (gameState.gameStatus === "finished" || gameState.gameStatus === "completed") {
    return (
      <GameResult 
        players={gameState.players}
        winner={gameState.winner}
        onRestart={onReset}
        onHome={onHome}
      />
    );
  }
  
  return (
    <>
      {renderAIIndicator()}
      
      <PowerupActiveIndicator 
        isActive={isPowerupActive} 
        isMyTurn={isMyTurn}
        powerupType={activePowerupType}
        onCancel={cancelPowerupMode}
      />
      
      <TurnIndicator 
        gameState={gameState}
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        activePowerupType={activePowerupType}
      />
      
      <PlayerInfoWrapper
        gameState={gameState}
        playerNumber={playerNumber}
        isMyTurn={isMyTurn}
        onUsePowerup={onUsePowerup}
      />
      
      <MultiplayerGameBoard
        gameState={gameState}
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        selectedPiece={selectedPiece}
        previewPosition={previewPosition}
        isValidPlacement={isValidPlacement}
        onCellClick={onCellClick}
        onCellHover={onCellHover}
      />
      
      <PieceSelectorWrapper
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        playerNumber={playerNumber}
        pieces={gameState.players[playerNumber || 0]?.pieces || []}
        selectedPiece={selectedPiece}
        onSelectPiece={onSelectPiece}
        onRotatePiece={onRotatePiece}
        onFlipPiece={onFlipPiece}
      />
      
      <MultiplayerGameControls
        isMyTurn={isMyTurn}
        turnHistoryLength={gameState.turnHistory.length}
        gameStatus={gameState.gameStatus}
        onUndo={onUndo}
        onReset={onReset}
        onPass={onPass}
        onHome={onHome}
      />
    </>
  );
};

export default MultiplayerGameContent;
