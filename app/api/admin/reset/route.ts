import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';

export async function POST() {
  try {
    // Get all player IDs from leaderboard
    const playerIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1
    ) as string[];

    // Delete all player data
    const deletePromises = playerIds.map(playerId =>
      redis.del(RedisKeys.player(playerId))
    );
    await Promise.all(deletePromises);

    // Delete leaderboard
    await redis.del(RedisKeys.leaderboard());

    // Reset winners
    await redis.set(RedisKeys.winners(), JSON.stringify({
      firstRow: null,
      blackout: null,
    }));

    return NextResponse.json({
      success: true,
      message: 'Game data has been reset',
      deletedPlayers: playerIds.length,
    });
  } catch (error) {
    console.error('Error resetting game data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset game data' },
      { status: 500 }
    );
  }
}
