
// Re-export all AI-related utilities from their specific files
import { AIDifficulty } from './ai/aiTypes';
import { findAIMove } from './ai/aiMoveStrategy';

// Export the main AI functions and types
export { AIDifficulty, findAIMove };

// This file now serves as the main entry point for AI utilities
// while delegating implementation details to smaller, focused files
