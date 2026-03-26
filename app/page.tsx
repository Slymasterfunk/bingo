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
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 flex items-center justify-center p-4 relative overflow-hidden">
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

      <main className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 relative z-10 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-light">geeks</span> <span className="font-bold text-yellow-500">&&</span> <span className="text-yellow-500 font-mono">{'{...}'}</span> <span className="font-light">presents:</span>
            </p>
            <h1 className="text-2xl md:text-3xl font-light tracking-widest text-gray-800 mb-2">
              2<sup className="text-sm">ND</sup> ANNUAL
            </h1>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-4">
              APRIL
            </h2>
            <p className="text-xl font-light text-gray-600 tracking-wide">
              Networking Bingo
            </p>
          </div>
          <p className="text-sm text-gray-500 italic">
            innovation / ethics / impact
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-6 mb-8 border border-purple-200/50">
          <h2 className="text-lg font-bold text-gray-900 mb-3">How to Play:</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2 text-purple-600">1.</span>
              <span>Enter your name and start playing</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-purple-600">2.</span>
              <span>Meet people who match the prompts on your bingo card</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-cyan-600">3.</span>
              <span>Tap a square and enter their name to mark it complete</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-cyan-600">4.</span>
              <span>Get 5 in a row (horizontal, vertical, or diagonal) to win!</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-500">5.</span>
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
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-lg"
              autoComplete="name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
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
