import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, PlayerProgress } from '@/lib/types';

// ✅ PERFORMANCE: Optimized with batch operations (MGET instead of loops)
export async function GET() {
  try {
    // Get winners (single operation)
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Get leaderboard IDs (single operation)
    const leaderboardIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1,
      { rev: true } // Highest scores first
    ) as string[];

    // ✅ OPTIMIZATION: Batch fetch all players at once with MGET
    const players: PlayerProgress[] = [];
    if (leaderboardIds.length > 0) {
      const playerKeys = leaderboardIds.map(id => RedisKeys.player(id));
      const playerDataArray = await redis.mget(...playerKeys);

      for (const playerData of playerDataArray) {
        if (playerData) {
          const player: PlayerProgress = typeof playerData === 'string'
            ? JSON.parse(playerData)
            : playerData;
          players.push(player);
        }
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
