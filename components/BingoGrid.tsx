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
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [winningPatterns, setWinningPatterns] = useState<number[][]>([]);

  const completedSquares = getCompletedSquares(gameState.cardState);

  // Update progress on server whenever card state changes
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch('/api/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: gameState.playerId,
            playerName: gameState.playerName,
            completedSquares,
            hasRow: gameState.hasClaimedRow,
            hasBlackout: gameState.hasClaimedBlackout,
          }),
        });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    };

    updateProgress();
  }, [completedSquares, gameState.playerId, gameState.playerName, gameState.hasClaimedRow, gameState.hasClaimedBlackout]);

  // Check for wins and claim prizes
  useEffect(() => {
    const winResult = checkForWin(gameState.cardState);

    // Update winning patterns for UI highlighting
    setWinningPatterns(getAllWinningPatterns(gameState.cardState));

    // Claim first row prize
    if (winResult.hasRow && !gameState.hasClaimedRow && winResult.winningPattern) {
      claimRowPrize(winResult.winningPattern);
    }

    // Claim blackout prize
    if (winResult.hasBlackout && !gameState.hasClaimedBlackout) {
      claimBlackoutPrize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.cardState, gameState.hasClaimedRow, gameState.hasClaimedBlackout]);

  const claimRowPrize = async (winningPattern: number[]) => {
    try {
      const response = await fetch('/api/submit-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: gameState.playerId,
          playerName: gameState.playerName,
          cardState: gameState.cardState,
          winningPattern,
        }),
      });

      const data = await response.json();

      if (data.isWinner) {
        setCelebrationMessage(data.message);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 8000);
        onUpdateGameState({ hasClaimedRow: true });
      } else if (data.success === false) {
        // Someone else won
        setCelebrationMessage(`Nice try! ${data.message}`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
        onUpdateGameState({ hasClaimedRow: true });
      }
    } catch (error) {
      console.error('Failed to claim row prize:', error);
    }
  };

  const claimBlackoutPrize = async () => {
    try {
      const response = await fetch('/api/submit-blackout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: gameState.playerId,
          playerName: gameState.playerName,
          cardState: gameState.cardState,
        }),
      });

      const data = await response.json();

      if (data.isWinner) {
        setCelebrationMessage(data.message);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 10000);
        onUpdateGameState({ hasClaimedBlackout: true });
      } else if (data.success === false) {
        // Someone else won
        setCelebrationMessage(`Nice try! ${data.message}`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
        onUpdateGameState({ hasClaimedBlackout: true });
      }
    } catch (error) {
      console.error('Failed to claim blackout prize:', error);
    }
  };

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
            {celebrationMessage || '🎉 Congratulations! You got a line! 🎉'}
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
