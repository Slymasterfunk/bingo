import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { PlayerProgress } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, completedSquares, hasRow, hasBlackout } = body;

    // Validate required fields
    if (!playerId || !playerName || typeof completedSquares !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, playerName, completedSquares' },
        { status: 400 }
      );
    }

    const playerProgress: PlayerProgress = {
      playerId,
      playerName,
      completedSquares,
      hasRow: hasRow || false,
      hasBlackout: hasBlackout || false,
      lastUpdate: Date.now(),
    };

    // Store player progress in Redis
    await redis.set(RedisKeys.player(playerId), JSON.stringify(playerProgress));

    // Update leaderboard sorted set (score = completedSquares)
    await redis.zadd(RedisKeys.leaderboard(), {
      score: completedSquares,
      member: playerId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
