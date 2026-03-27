'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Winners, PlayerProgress } from '@/lib/types';

type Tab = 'overview' | 'players' | 'leaderboard' | 'actions';

interface LeaderboardData {
  winners: Winners;
  players: PlayerProgress[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin');
    }
  }, [router]);

  // Fetch data
  const fetchData = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setError('');
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    router.push('/admin');
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'players', label: 'Players', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'actions', label: 'Actions', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Networking Bingo</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'players' && <PlayersTab players={data?.players || []} />}
        {activeTab === 'leaderboard' && <LeaderboardTab data={data} />}
        {activeTab === 'actions' && <ActionsTab onRefresh={fetchData} />}
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: LeaderboardData | null }) {
  if (!data) return <div>Loading...</div>;

  const totalPlayers = data.players.length;
  const playersWithRow = data.players.filter(p => p.hasRow).length;
  const playersWithBlackout = data.players.filter(p => p.hasBlackout).length;
  const avgCompletion = totalPlayers > 0
    ? Math.round(data.players.reduce((sum, p) => sum + p.completedSquares, 0) / totalPlayers)
    : 0;

  const stats = [
    { label: 'Total Players', value: totalPlayers, icon: '👥', color: 'blue' },
    { label: 'Players with Row', value: playersWithRow, icon: '✓', color: 'green' },
    { label: 'Blackouts', value: playersWithBlackout, icon: '⬛', color: 'purple' },
    { label: 'Avg. Completion', value: `${avgCompletion}/24`, icon: '📊', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Winners */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Prize Winners</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="font-semibold text-gray-900">First Row/Column/Diagonal</p>
            {data.winners.firstRow ? (
              <div>
                <p className="text-lg text-gray-900">{data.winners.firstRow.playerName}</p>
                <p className="text-sm text-gray-600">
                  {new Date(data.winners.firstRow.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No winner yet</p>
            )}
          </div>

          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="font-semibold text-gray-900">Blackout (All Squares)</p>
            {data.winners.blackout ? (
              <div>
                <p className="text-lg text-gray-900">{data.winners.blackout.playerName}</p>
                <p className="text-sm text-gray-600">
                  {new Date(data.winners.blackout.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No winner yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Most Active Players</h2>
        <div className="space-y-2">
          {data.players
            .slice(0, 5)
            .map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{player.playerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">{player.completedSquares}/24</span>
                  {player.hasRow && <span className="ml-2">✓</span>}
                  {player.hasBlackout && <span className="ml-2">⬛</span>}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Players Tab Component
function PlayersTab({ players }: { players: PlayerProgress[] }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">All Active Players ({players.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Has Row
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blackout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.playerId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {player.playerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.completedSquares}/24
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(player.completedSquares / 24) * 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {player.hasRow ? (
                    <span className="text-green-600 font-semibold">✓ Yes</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {player.hasBlackout ? (
                    <span className="text-purple-600 font-semibold">⬛ Yes</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(player.lastUpdate).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ data }: { data: LeaderboardData | null }) {
  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">🏆 Live Leaderboard</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {data.players.map((player, index) => {
            const isFirstRow = data.winners.firstRow?.playerId === player.playerId;
            const isBlackout = data.winners.blackout?.playerId === player.playerId;

            return (
              <div
                key={player.playerId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isBlackout
                    ? 'bg-purple-50 border-2 border-purple-500'
                    : isFirstRow
                    ? 'bg-yellow-50 border-2 border-yellow-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-600' :
                    'text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{player.playerName}</p>
                    <p className="text-sm text-gray-600">
                      {player.completedSquares}/24 squares completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isFirstRow && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      🏆 First Row
                    </span>
                  )}
                  {isBlackout && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      ⬛ Blackout
                    </span>
                  )}
                  {player.hasRow && !isFirstRow && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Actions Tab Component
function ActionsTab({ onRefresh }: { onRefresh: () => void }) {
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleReset = async () => {
    setIsResetting(true);
    setResetSuccess('');
    setResetError('');

    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
      });

      if (response.ok) {
        setResetSuccess('Game data has been reset successfully!');
        setShowResetConfirm(false);
        onRefresh();
      } else {
        setResetError('Failed to reset game data');
      }
    } catch (err) {
      setResetError('Network error occurred');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch('/api/admin/export-csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bingo-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download CSV');
      }
    } catch (err) {
      alert('Network error occurred');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Refresh */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🔄 Refresh Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manually refresh the dashboard data to see the latest updates.
        </p>
        <button
          onClick={onRefresh}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Refresh Now
        </button>
      </div>

      {/* Download CSV */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">📥 Download Results</h3>
        <p className="text-sm text-gray-600 mb-4">
          Export all player data and results as a CSV file for analysis or record-keeping.
        </p>
        <button
          onClick={handleDownloadCSV}
          disabled={isDownloading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : 'Download CSV'}
        </button>
      </div>

      {/* Reset Game */}
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
        <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Reset Game Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Warning:</strong> This will permanently delete all player data, progress, and winners.
          This action cannot be undone. Use this to prepare for a new event.
        </p>

        {resetSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {resetSuccess}
          </div>
        )}

        {resetError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {resetError}
          </div>
        )}

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Reset Game Data
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="font-semibold text-red-900 mb-3">
              Are you absolutely sure? This will delete all data!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
