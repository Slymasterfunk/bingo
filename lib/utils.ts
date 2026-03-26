import { BINGO_PROMPTS, FREE_SPACE, CENTER_INDEX } from './bingoPrompts';
import { SquareState } from './types';

/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a randomized bingo card with FREE SPACE always at center (index 12)
 * Uses Fisher-Yates shuffle for true randomization
 */
export function generateRandomCard(): string[] {
  // Get all prompts except FREE SPACE
  const nonFreePrompts = BINGO_PROMPTS.filter(p => p !== FREE_SPACE);

  // Fisher-Yates shuffle for true randomization
  const shuffled = [...nonFreePrompts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Insert FREE SPACE at center position (index 12)
  const card = [
    ...shuffled.slice(0, CENTER_INDEX),
    FREE_SPACE,
    ...shuffled.slice(CENTER_INDEX)
  ];

  return card; // Array of 25 prompts in random order
}

/**
 * Generates initial card state from prompts
 * FREE SPACE is auto-marked
 */
export function generateInitialCardState(cardPrompts: string[]): SquareState[] {
  return cardPrompts.map((prompt, index) => ({
    index,
    prompt,
    marked: prompt === FREE_SPACE,
    personName: prompt === FREE_SPACE ? 'Free!' : null
  }));
}

/**
 * Calculates number of completed squares (excluding free space if needed)
 */
export function getCompletedSquares(cardState: SquareState[]): number {
  return cardState.filter(square => square.marked).length;
}
