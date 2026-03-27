import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, PlayerProgress } from '@/lib/types';

export async function GET() {
  try {
    // Get winners
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Get leaderboard (sorted by completed squares, descending)
    const leaderboardIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1,
      { rev: true } // Reverse order (highest scores first)
    );

    // Fetch player data for each ID in leaderboard
    const players: PlayerProgress[] = [];
    for (const playerId of leaderboardIds) {
      const playerData = await redis.get(RedisKeys.player(playerId));
      if (playerData) {
        const player: PlayerProgress = typeof playerData === 'string'
          ? JSON.parse(playerData)
          : playerData;
        players.push(player);
      }
    }

    return NextResponse.json({
      winners,
      players,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
