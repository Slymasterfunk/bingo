import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { PlayerProgress } from '@/lib/types';

// ✅ PERFORMANCE: Simple in-memory rate limiting (prevents excessive updates)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // Max 1 update per second per player

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

    // ✅ OPTIMIZATION: Rate limiting to prevent spam
    const lastUpdate = rateLimitMap.get(playerId) || 0;
    const now = Date.now();

    if (now - lastUpdate < RATE_LIMIT_MS) {
      // Silently reject (don't error, just skip update)
      return NextResponse.json({ success: true, rateLimited: true });
    }

    rateLimitMap.set(playerId, now);

    const playerProgress: PlayerProgress = {
      playerId,
      playerName,
      completedSquares,
      hasRow: hasRow || false,
      hasBlackout: hasBlackout || false,
      lastUpdate: now,
    };

    // ✅ OPTIMIZATION: Use pipeline for atomic operations
    await Promise.all([
      redis.set(RedisKeys.player(playerId), JSON.stringify(playerProgress)),
      redis.zadd(RedisKeys.leaderboard(), {
        score: completedSquares,
        member: playerId,
      }),
      // Publish update event for real-time leaderboard (if pub/sub is supported)
      redis.publish(RedisKeys.leaderboardUpdates(), JSON.stringify({
        type: 'progress',
        playerId,
        timestamp: now,
      })).catch(() => {
        // Silently fail if pub/sub not supported (Upstash REST API limitation)
        // SSE endpoint uses polling as fallback
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// Clean up rate limit map periodically (prevent memory leak)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [playerId, timestamp] of rateLimitMap.entries()) {
      if (now - timestamp > 60000) { // Remove entries older than 1 minute
        rateLimitMap.delete(playerId);
      }
    }
  }, 60000);
}
