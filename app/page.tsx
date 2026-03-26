'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      // Store player name in sessionStorage for the /play page to pick up
      sessionStorage.setItem('pendingPlayerName', playerName.trim());
      router.push('/play');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <main className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Networking Bingo
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Alamo Tech Collective × Geeks && {'{...}'}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">How to Play:</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Enter your name and start playing</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Meet people who match the prompts on your bingo card</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Tap a square and enter their name to mark it complete</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Get 5 in a row (horizontal, vertical, or diagonal) to win!</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">5.</span>
              <span>Complete ALL squares for a blackout bonus!</span>
            </li>
          </ol>
        </div>

        {/* Start form */}
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Name:
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g., Alex Johnson"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
              autoComplete="name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Start Playing
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Have fun networking and may the best bingo player win! 🎉
        </p>
      </main>
    </div>
  );
}
