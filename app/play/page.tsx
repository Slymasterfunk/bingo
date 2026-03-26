'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameState } from '@/lib/types';
import { generateUUID, generateRandomCard, generateInitialCardState } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import BingoGrid from '@/components/BingoGrid';

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useLocalStorage<GameState | null>('bingoGameState', null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double-initialization in React strict mode
    if (hasInitialized.current) {
      return;
    }

    // Check if we have an existing game
    if (gameState) {
      setIsLoading(false);
      hasInitialized.current = true;
      return;
    }

    // Check for pending player name from landing page
    const pendingName = sessionStorage.getItem('pendingPlayerName');
    if (pendingName) {
      // Create new game
      const cardPrompts = generateRandomCard();
      const newGame: GameState = {
        playerId: generateUUID(),
        playerName: pendingName,
        cardPrompts,
        cardState: generateInitialCardState(cardPrompts),
        hasClaimedRow: false,
        hasClaimedBlackout: false,
        createdAt: Date.now()
      };

      setGameState(newGame);
      sessionStorage.removeItem('pendingPlayerName');
      setIsLoading(false);
      hasInitialized.current = true;
    } else {
      // No game and no pending name, redirect to home
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateGameState = (updates: Partial<GameState>) => {
    if (!gameState) return;
    setGameState({ ...gameState, ...updates });
  };

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your bingo card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Networking Bingo
          </h1>
          <p className="text-gray-600">
            Alamo Tech Collective × Geeks && {'{...}'}
          </p>
        </div>

        {/* Bingo Grid */}
        <BingoGrid gameState={gameState} onUpdateGameState={handleUpdateGameState} />

        {/* Bottom actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to start a new game? Your current progress will be lost.')) {
                setGameState(null);
                sessionStorage.removeItem('pendingPlayerName');
                router.push('/');
              }
            }}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
