'use client';

import { useState, useEffect } from 'react';
import { GameState, SquareState } from '@/lib/types';
import { checkForWin, getAllWinningPatterns } from '@/lib/winDetection';
import { getCompletedSquares } from '@/lib/utils';
import BingoSquare from './BingoSquare';
import NameInputModal from './NameInputModal';
import ProgressTracker from './ProgressTracker';

interface BingoGridProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
}

export default function BingoGrid({ gameState, onUpdateGameState }: BingoGridProps) {
  const [selectedSquare, setSelectedSquare] = useState<SquareState | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winningPatterns, setWinningPatterns] = useState<number[][]>([]);

  const completedSquares = getCompletedSquares(gameState.cardState);

  // Check for wins whenever card state changes
  useEffect(() => {
    const winResult = checkForWin(gameState.cardState);

    // Update winning patterns for UI highlighting
    setWinningPatterns(getAllWinningPatterns(gameState.cardState));

    // Show celebration if player just won
    if (winResult.hasRow && !gameState.hasClaimedRow) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }

    if (winResult.hasBlackout && !gameState.hasClaimedBlackout) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 8000);
    }
  }, [gameState.cardState, gameState.hasClaimedRow, gameState.hasClaimedBlackout]);

  const handleSquareClick = (square: SquareState) => {
    if (square.prompt === "FREE SPACE") return;
    setSelectedSquare(square);
  };

  const handleNameSubmit = (name: string) => {
    if (!selectedSquare) return;

    const updatedCardState = gameState.cardState.map(square =>
      square.index === selectedSquare.index
        ? { ...square, marked: true, personName: name }
        : square
    );

    onUpdateGameState({ cardState: updatedCardState });
    setSelectedSquare(null);
  };

  const handleModalClose = () => {
    setSelectedSquare(null);
  };

  // Determine which squares are part of winning patterns
  const winningSquareIndices = new Set(winningPatterns.flat());

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Player name */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {gameState.playerName}
        </h2>
      </div>

      {/* Progress tracker */}
      <ProgressTracker completedSquares={completedSquares} totalSquares={25} />

      {/* Celebration message */}
      {showCelebration && (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg text-center animate-pulse">
          <p className="text-xl font-bold text-gray-900">
            🎉 Congratulations! You got a line! 🎉
          </p>
        </div>
      )}

      {/* Bingo grid (5x5) */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {gameState.cardState.map((square) => (
          <BingoSquare
            key={square.index}
            square={square}
            onClick={() => handleSquareClick(square)}
            isWinning={winningSquareIndices.has(square.index)}
          />
        ))}
      </div>

      {/* Name input modal */}
      <NameInputModal
        isOpen={!!selectedSquare}
        prompt={selectedSquare?.prompt || ''}
        currentName={selectedSquare?.personName || null}
        onSubmit={handleNameSubmit}
        onClose={handleModalClose}
      />
    </div>
  );
}
