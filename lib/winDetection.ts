import { SquareState, WinResult } from './types';

// Winning patterns (0-indexed positions)
// 5 rows + 5 columns + 2 diagonals = 12 total patterns
export const WINNING_PATTERNS: number[][] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],

  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],

  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

/**
 * Checks if the player has won (row/column/diagonal or blackout)
 * Returns the type of win and the winning pattern
 */
export function checkForWin(cardState: SquareState[]): WinResult {
  // Check each pattern for a row/column/diagonal win
  for (const pattern of WINNING_PATTERNS) {
    const allMarked = pattern.every(index => cardState[index].marked);
    if (allMarked) {
      return {
        hasRow: true,
        hasBlackout: false,
        winningPattern: pattern
      };
    }
  }

  // Check blackout (all 25 marked)
  const allMarked = cardState.every(square => square.marked);
  if (allMarked) {
    return {
      hasRow: true, // Blackout implies they also have a row
      hasBlackout: true,
      winningPattern: null
    };
  }

  return { hasRow: false, hasBlackout: false, winningPattern: null };
}

/**
 * Gets all winning patterns for a card (useful for UI highlighting)
 */
export function getAllWinningPatterns(cardState: SquareState[]): number[][] {
  const winningPatterns: number[][] = [];

  for (const pattern of WINNING_PATTERNS) {
    const allMarked = pattern.every(index => cardState[index].marked);
    if (allMarked) {
      winningPatterns.push(pattern);
    }
  }

  return winningPatterns;
}
