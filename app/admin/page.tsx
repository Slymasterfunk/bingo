'use client';

import { useState, useEffect } from 'react';
import { Winners, PlayerProgress } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface LeaderboardData {
  winners: Winners;
  players: PlayerProgress[];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple client-side check (use environment variable in production)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      fetchData();
    } else {
      setError('Invalid password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL game data! Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reset', { method: 'POST' });
      if (response.ok) {
        alert('✅ Game data reset successfully!');
        fetchData();
      } else {
        alert('❌ Failed to reset data');
      }
    } catch (error) {
      alert('❌ Error resetting data');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login__card">
          <h1 className="admin-login__title">Admin Login</h1>
          <form onSubmit={handleLogin} className="admin-login__form">
            <div>
              <label htmlFor="password" className="admin-login__label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login__input"
                required
              />
            </div>
            {error && <p className="admin-login__error">{error}</p>}
            <button
              type="submit"
              className="btn btn--blue btn--full btn--lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header__content">
            <h1 className="admin-header__title">Admin Dashboard</h1>
            <div className="admin-header__actions">
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn--blue"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
              <button
                onClick={handleLogout}
                className="btn btn--secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Total Players</p>
            <p className="admin-stat-card__value">{data?.players.length || 0}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Rows Completed</p>
            <p className="admin-stat-card__value admin-stat-card__value--yellow">
              {data?.players.filter(p => p.hasRow).length || 0}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Blackouts</p>
            <p className="admin-stat-card__value admin-stat-card__value--purple">
              {data?.players.filter(p => p.hasBlackout).length || 0}
            </p>
          </div>
        </div>

        {/* Winners */}
        <div className="admin-winners">
          <h2 className="admin-winners__title">🏆 Prize Winners</h2>
          <div className="admin-winners__grid">
            <div className="admin-winners__item admin-winners__item--yellow">
              <p className="admin-winners__label">First Row</p>
              {data?.winners.firstRow ? (
                <p className="admin-winners__name">{data.winners.firstRow.playerName}</p>
              ) : (
                <p className="admin-winners__empty">No winner yet</p>
              )}
            </div>
            <div className="admin-winners__item admin-winners__item--purple">
              <p className="admin-winners__label">Blackout</p>
              {data?.winners.blackout ? (
                <p className="admin-winners__name">{data.winners.blackout.playerName}</p>
              ) : (
                <p className="admin-winners__empty">No winner yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="admin-players">
          <div className="admin-players__header">
            <h2>All Players</h2>
          </div>
          {data?.players && data.players.length > 0 ? (
            <div className="admin-players__table-container">
              <table className="admin-players__table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th className="text-center">Squares</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.players.map((player, index) => (
                    <tr key={player.playerId}>
                      <td><span className="admin-players__rank">#{index + 1}</span></td>
                      <td><span className="admin-players__player-name">{player.playerName}</span></td>
                      <td className="text-center"><span className="admin-players__score">{player.completedSquares}/25</span></td>
                      <td className="text-center">
                        <div className="admin-players__status">
                          {player.hasRow && <span className="admin-players__badge admin-players__badge--yellow">Row</span>}
                          {player.hasBlackout && <span className="admin-players__badge admin-players__badge--purple">Blackout</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-players__empty">No players yet</div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <h3 className="danger-zone__title">⚠️ Danger Zone</h3>
          <p className="danger-zone__description">This will permanently delete all game data. Cannot be undone!</p>
          <button
            onClick={handleReset}
            className="btn btn--danger btn--lg"
          >
            Reset All Game Data
          </button>
        </div>
      </div>
    </div>
  );
}
