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
  const [isConnected, setIsConnected] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
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
    // Connect to SSE endpoint for real-time updates
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/leaderboard/stream');

        eventSource.onopen = () => {
          console.log('SSE connection established');
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'initial' || message.type === 'update') {
              setData(message.data);
              setLoading(false);
            }
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          eventSource?.close();

          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        };
      } catch (err) {
        console.error('Error creating EventSource:', err);
        setError('Failed to connect to real-time updates');
        setLoading(false);
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__content">
          <div className="spinner"></div>
          <p className="loading-screen__text">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="card card--center">
          <p className="error__message">Error: {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="btn btn--blue"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="container container--wide">
        {/* Header with Manual Refresh */}
        <div className="page-header">
          <h1 className="page-header__title">
            Leaderboard
          </h1>
          <div className="page-header__info">
            <p className="page-header__subtitle">
              {isConnected ? '🟢 Live updates' : '🔴 Reconnecting...'}
            </p>
            <div className="page-header__actions">
              <button
                onClick={fetchLeaderboard}
                disabled={loading}
                className="btn btn--blue"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Winners Section */}
        <div className="grid grid--2">
          {/* First Row Winner */}
          <div className="winner-card">
            <div className="winner-card__header">
              <span className="icon">🏆</span>
              <h2 className="title">First Row</h2>
            </div>
            {data?.winners.firstRow ? (
              <div>
                <p className="winner-card__winner-name">{data.winners.firstRow.playerName}</p>
                <p className="winner-card__timestamp">
                  {new Date(data.winners.firstRow.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <p className="winner-card__empty">No winner yet...</p>
            )}
          </div>

          {/* Blackout Winner */}
          <div className="winner-card">
            <div className="winner-card__header">
              <span className="icon">🎊</span>
              <h2 className="title">Blackout</h2>
            </div>
            {data?.winners.blackout ? (
              <div>
                <p className="winner-card__winner-name">{data.winners.blackout.playerName}</p>
                <p className="winner-card__timestamp">
                  {new Date(data.winners.blackout.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <p className="winner-card__empty">No winner yet...</p>
            )}
          </div>
        </div>

        {/* Player Standings */}
        <div className="rankings">
          <div className="rankings__header">
            <h2>Player Standings</h2>
          </div>

          {data?.players && data.players.length > 0 ? (
            <div className="rankings__table-container">
              <table className="rankings__table">
                <thead>
                  <tr>
                    <th>
                      Rank
                    </th>
                    <th>
                      Player
                    </th>
                    <th className="text-center">
                      Squares
                    </th>
                    <th className="text-center">
                      Progress
                    </th>
                    <th className="text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.players.map((player, index) => (
                    <tr key={player.playerId}>
                      <td>
                        <span className="rankings__rank">
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="rankings__player-name">{player.playerName}</div>
                      </td>
                      <td className="text-center">
                        <span className="rankings__score">
                          {player.completedSquares}/25
                        </span>
                      </td>
                      <td>
                        <div className="rankings__progress-bar">
                          <div
                            className="fill"
                            style={{ width: `${(player.completedSquares / 25) * 100}%` }}
                          />
                        </div>
                        <span className="progress__label">
                          {Math.round((player.completedSquares / 25) * 100)}%
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="rankings__status">
                          {player.hasRow && (
                            <span className="badge badge--yellow">
                              Row ✓
                            </span>
                          )}
                          {player.hasBlackout && (
                            <span className="badge badge--purple">
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
            <div className="rankings__empty">
              <p>No players yet. Be the first to start playing!</p>
            </div>
          )}
        </div>

        {/* Back to Game Button */}
        <div className="game-actions">
          <Link
            href="/play"
            className="btn btn--primary btn--lg"
          >
            Back to Game
          </Link>
        </div>
      </div>
    </div>
  );
}
