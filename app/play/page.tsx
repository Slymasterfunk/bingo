'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="loading-screen">
        <div className="loading-screen__content">
          <div className="spinner"></div>
          <p className="loading-screen__text">Loading your bingo card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="play-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-header__title">
            Networking Bingo
          </h1>
          <p className="page-header__subtitle">
            Geeks &amp;&amp; &#123;...&#125; | Alamo Tech Collective
          </p>
        </div>

        {/* Bingo Grid */}
        <BingoGrid gameState={gameState} onUpdateGameState={handleUpdateGameState} />

        {/* Bottom actions */}
        <div className="game-actions">
          <Link
            href="/leaderboard"
            className="btn btn--primary"
          >
            View Leaderboard
          </Link>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to start a new game? Your current progress will be lost.')) {
                setGameState(null);
                sessionStorage.removeItem('pendingPlayerName');
                router.push('/');
              }
            }}
            className="btn btn--secondary"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
