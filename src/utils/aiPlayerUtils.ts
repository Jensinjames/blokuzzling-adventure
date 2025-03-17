
// Re-export all AI-related utilities from their specific files
import { findAIMove } from './ai/aiMoveStrategy';
import type { AIDifficulty } from './ai/aiTypes';

// Export the main AI functions and types
export { findAIMove };
export type { AIDifficulty };

// This file now serves as the main entry point for AI utilities
// while delegating implementation details to smaller, focused files
