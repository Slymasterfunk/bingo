// Client-Side Types
export interface GameState {
  playerId: string;           // UUID v4
  playerName: string;
  cardPrompts: string[];      // Randomized array of 25 prompts (FREE SPACE always at index 12)
  cardState: SquareState[];   // Array of 25
  hasClaimedRow: boolean;
  hasClaimedBlackout: boolean;
  createdAt: number;          // Timestamp
}

export interface SquareState {
  index: number;              // 0-24
  prompt: string;             // From cardPrompts[index]
  marked: boolean;
  personName: string | null;
}

// Win Detection
export interface WinResult {
  hasRow: boolean;
  hasBlackout: boolean;
  winningPattern: number[] | null;
}

// Server-Side Types (for API routes)
export interface Winner {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface Winners {
  firstRow: Winner | null;
  blackout: Winner | null;
}

export interface PlayerProgress {
  playerId: string;
  playerName: string;
  completedSquares: number;   // 0-24
  hasRow: boolean;
  hasBlackout: boolean;
  lastUpdate: number;
}
