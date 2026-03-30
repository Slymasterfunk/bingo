// Optimized Redis client for Vercel KV
// Uses connection pooling and proper error handling

import { Redis } from '@upstash/redis';

// Singleton pattern to reuse connection
let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error('Redis environment variables not configured');
    }

    redisInstance = new Redis({
      url,
      token,
      // Performance optimizations
      automaticDeserialization: true,
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
      },
    });
  }

  return redisInstance;
}

// Export singleton instance
export const redis = getRedisClient();

// Redis key helpers (consistent key naming)
export const RedisKeys = {
  winners: () => 'bingo:winners',
  player: (playerId: string) => `bingo:player:${playerId}`,
  leaderboard: () => 'bingo:leaderboard',
  leaderboardUpdates: () => 'bingo:leaderboard:updates', // Pub/sub channel
};
