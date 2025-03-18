
import { useGameSessionFetch } from './game/useGameSessionFetch';
import { useGamePlayersFetch } from './game/useGamePlayersFetch';
import { useGameStateInitializer } from './game/useGameStateInitializer';
import { useState, useEffect } from 'react';

export function useGameData(gameId: string) {
  // Get session data
  const { 
    gameSession, 
    setGameSession, 
    loading: sessionLoading, 
    error: sessionError 
  } = useGameSessionFetch(gameId);
  
  // Get players data
  const { 
    players, 
    playerNumber, 
    loading: playersLoading, 
    error: playersError 
  } = useGamePlayersFetch(gameId);
  
  // Initialize/load game state
  const { 
    gameState, 
    setGameState, 
    loading: stateLoading, 
    error: stateError 
  } = useGameStateInitializer(gameSession, players, gameId);
  
  // Combine loading states
  const loading = sessionLoading || playersLoading || stateLoading;
  
  // Combine errors
  const error = sessionError || playersError || stateError;
  
  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Game data error:', error);
    }
  }, [error]);

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    error
  };
}
