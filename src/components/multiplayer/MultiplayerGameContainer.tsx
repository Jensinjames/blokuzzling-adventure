
import React from 'react';
import { GameState, BoardPosition, Piece } from '@/types/game';
import GameResult from '@/components/GameResult';
import PlayerInfo from '@/components/PlayerInfo';
import MultiplayerHeader from '@/components/multiplayer/MultiplayerHeader';
import MultiplayerGameContent from '@/components/multiplayer/MultiplayerGameContent';
import PowerupActiveIndicator from '@/components/multiplayer/PowerupActiveIndicator';
import TurnIndicator from '@/components/multiplayer/TurnIndicator';

interface MultiplayerGameContainerProps {
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
  onUsePowerup: (playerId: number, powerupType: string) => void;
  cancelPowerupMode: () => void;
}

const MultiplayerGameContainer: React.FC<MultiplayerGameContainerProps> = ({
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
  onUsePowerup,
  cancelPowerupMode
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <MultiplayerHeader onHome={onHome} />
        
        <PlayerInfo
          players={gameState.players}
          currentPlayer={gameState.currentPlayer}
          onUsePowerup={onUsePowerup}
          isViewerCurrentPlayer={isMyTurn}
        />
        
        {gameState.gameStatus === "finished" || gameState.gameStatus === "completed" ? (
          <GameResult
            players={gameState.players}
            winner={gameState.winner}
            onRestart={onReset}
            onHome={onHome}
          />
        ) : (
          <>
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
            
            <MultiplayerGameContent
              gameState={gameState}
              playerNumber={playerNumber}
              isMyTurn={isMyTurn}
              selectedPiece={selectedPiece}
              previewPosition={previewPosition}
              isValidPlacement={isValidPlacement}
              isPowerupActive={isPowerupActive}
              activePowerupType={activePowerupType}
              onCellClick={onCellClick}
              onCellHover={onCellHover}
              onSelectPiece={onSelectPiece}
              onRotatePiece={onRotatePiece}
              onFlipPiece={onFlipPiece}
              onUndo={onUndo}
              onReset={onReset}
              onPass={onPass}
              onHome={onHome}
              cancelPowerupMode={cancelPowerupMode}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameContainer;
