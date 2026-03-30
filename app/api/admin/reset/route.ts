import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';

// ✅ PERFORMANCE: Lightweight reset with batch operations
export async function POST() {
  try {
    // Get all player IDs from leaderboard
    const leaderboardIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1
    ) as string[];

    // ✅ OPTIMIZATION: Batch delete operations
    const deletePromises = [];

    // Delete all player data
    for (const playerId of leaderboardIds) {
      deletePromises.push(redis.del(RedisKeys.player(playerId)));
    }

    // Delete leaderboard and winners
    deletePromises.push(redis.del(RedisKeys.leaderboard()));
    deletePromises.push(redis.del(RedisKeys.winners()));

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: 'Game data reset successfully',
      deletedPlayers: leaderboardIds.length,
    });
  } catch (error) {
    console.error('Error resetting game:', error);
    return NextResponse.json(
      { error: 'Failed to reset game data' },
      { status: 500 }
    );
  }
}
