'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();

  const handleStart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (playerName.trim()) {
      // Store player name in sessionStorage for the /play page to pick up
      sessionStorage.setItem('pendingPlayerName', playerName.trim());
      router.push('/play');
    }
  };

  return (
    <div className="sign-up">
      <main>
        {/* Header */}
        <div className="sign-up__header">
          <h1>Networking Bingo</h1>
          <p>Geeks &amp;&amp; &#123;...&#125; | Alamo Tech Collective</p>
        </div>

        {/* Instructions */}
        <div className="sign-up__instructions">
          <h2>How to Play:</h2>
          <ol>
            <li>
              <span className="number">1.</span>
              <span>Enter your name and start playing</span>
            </li>
            <li>
              <span className="number">2.</span>
              <span>Meet people who match the prompts on your bingo card</span>
            </li>
            <li>
              <span className="number">3.</span>
              <span>Tap a square and enter their name to mark it complete</span>
            </li>
            <li>
              <span className="number">4.</span>
              <span>Get 5 in a row (horizontal, vertical, or diagonal) to win!</span>
            </li>
            <li>
              <span className="number">5.</span>
              <span>Complete ALL squares for a blackout bonus!</span>
            </li>
          </ol>
        </div>

        {/* Start form */}
        <form onSubmit={handleStart} className="sign-up__form">
          <div className="sign-up__form-group">
            <label htmlFor="player-name" className="sign-up__label">
              Enter Your Name:
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g., Alex Johnson"
              className="sign-up__input"
              autoComplete="name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!playerName.trim()}
            className="btn btn--primary btn--lg btn--full"
          >
            Start Playing
          </button>
        </form>

        {/* Footer note */}
        <p className="sign-up__footer">
          Have fun networking and may the best bingo player win! 🎉
        </p>
      </main>
    </div>
  );
}
