
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerInfo from '@/components/PlayerInfo';
import GameHeader from '@/components/game/GameHeader';
import GameSetup from '@/components/game/GameSetup';
import GamePlayArea from '@/components/game/GamePlayArea';
import { useGameController } from '@/hooks/useGameController';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameProps {
  numPlayers?: number;
}

const Game: React.FC<GameProps> = ({ numPlayers = 2 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    initGame,
    setGameState
  } = useGameController(numPlayers);

  // Set player IDs correctly when game starts
  useEffect(() => {
    if (gameStarted && user) {
      // Set human player ID to user's ID for stats tracking
      setGameState(prevState => {
        const updatedPlayers = [...prevState.players];
        if (updatedPlayers[0]) {
          updatedPlayers[0] = {
            ...updatedPlayers[0],
            id: user.id // Use authenticated user ID
          };
        }
        // Ensure AI player has a consistent ID
        if (updatedPlayers[1]) {
          updatedPlayers[1] = {
            ...updatedPlayers[1],
            id: 'ai-player-' + (updatedPlayers[1].aiDifficulty || 'medium')
          };
        }
        return {
          ...prevState,
          players: updatedPlayers
        };
      });
    }
  }, [gameStarted, user, setGameState]);

  // Update game history when game is completed
  useEffect(() => {
    const saveGameHistory = async () => {
      if (isGameOver() && user && gameStarted) {
        try {
          console.log("Saving completed game to history...");
          // Calculate some game metrics
          const gameLength = gameState.turnHistory.length;
          const winner = gameState.winner !== null ? gameState.players[gameState.winner].id : null;
          const humanPlayer = gameState.players[0];
          const aiPlayer = gameState.players[1];
          
          // Determine result for the human player
          let result = 'draw';
          if (gameState.winner === 0) {
            result = 'win';
          } else if (gameState.winner === 1) {
            result = 'loss';
          }
          
          // Save game record
          const { error } = await supabase
            .from('game_sessions')
            .insert({
              creator_id: user.id,
              game_type: 'single_player',
              status: 'completed',
              winner_id: winner && typeof winner === 'string' ? winner : null,
              ai_difficulty: aiDifficulty,
              ai_enabled: true,
              ai_count: 1,
              max_players: 2,
              current_players: 1,
              game_state: {
                ...gameState,
                players: gameState.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  color: p.color,
                  score: p.score,
                  isAI: p.isAI,
                  aiDifficulty: p.aiDifficulty
                }))
              }
            });
            
          if (error) {
            console.error("Error saving game history:", error);
            toast.error("Failed to save game to your history");
          } else {
            console.log("Game history saved successfully");
            toast.success("Game saved to your history");
          }
        } catch (err) {
          console.error("Failed to save game history:", err);
        }
      }
    };
    
    saveGameHistory();
  }, [isGameOver, gameState, user, gameStarted, aiDifficulty]);

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
