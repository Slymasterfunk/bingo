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
      <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 flex items-center justify-center relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
                <path d="M0,60 Q25,40 50,60 T100,60" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2"/>
                <path d="M0,40 Q25,20 50,40 T100,40" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your bingo card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-8 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves-play" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M0,60 Q25,40 50,60 T100,60" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2"/>
              <path d="M0,40 Q25,20 50,40 T100,40" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves-play)" />
        </svg>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-white/90 text-sm mb-1">
            <span className="font-light">geeks</span> <span className="font-bold text-yellow-400">&&</span> <span className="text-yellow-400 font-mono">{'{...}'}</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Networking Bingo
          </h1>
          <p className="text-white/80 text-sm italic">
            innovation / ethics / impact
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
            className="px-6 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
