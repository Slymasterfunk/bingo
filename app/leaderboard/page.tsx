'use client';

import { useEffect, useState } from 'react';
import { Winners, PlayerProgress } from '@/lib/types';
import Link from 'next/link';

interface LeaderboardData {
  winners: Winners;
  players: PlayerProgress[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const leaderboardData: LeaderboardData = await response.json();
      setData(leaderboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600">
            Real-time standings • Auto-refreshes every 10 seconds
          </p>
        </div>

        {/* Winners Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* First Row Winner */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🏆</span>
              <h2 className="text-2xl font-bold">First Row</h2>
            </div>
            {data?.winners.firstRow ? (
              <div>
                <p className="text-xl font-semibold mb-1">{data.winners.firstRow.playerName}</p>
                <p className="text-sm opacity-90">
                  {new Date(data.winners.firstRow.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <p className="text-lg opacity-90">No winner yet...</p>
            )}
          </div>

          {/* Blackout Winner */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🎊</span>
              <h2 className="text-2xl font-bold">Blackout</h2>
            </div>
            {data?.winners.blackout ? (
              <div>
                <p className="text-xl font-semibold mb-1">{data.winners.blackout.playerName}</p>
                <p className="text-sm opacity-90">
                  {new Date(data.winners.blackout.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <p className="text-lg opacity-90">No winner yet...</p>
            )}
          </div>
        </div>

        {/* Player Standings */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Player Standings</h2>
          </div>

          {data?.players && data.players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Squares
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.players.map((player, index) => (
                    <tr key={player.playerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-gray-900">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{player.playerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {player.completedSquares}/25
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(player.completedSquares / 25) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {Math.round((player.completedSquares / 25) * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex gap-1 justify-center">
                          {player.hasRow && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Row ✓
                            </span>
                          )}
                          {player.hasBlackout && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Blackout ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="text-lg">No players yet. Be the first to start playing!</p>
            </div>
          )}
        </div>

        {/* Back to Game Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Back to Game
          </Link>
        </div>
      </div>
    </div>
  );
}
