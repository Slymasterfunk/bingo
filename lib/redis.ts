import { Redis } from '@upstash/redis';

// Initialize Redis client
// Uses Vercel KV environment variables (automatically set by Vercel)
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

// Type-safe Redis key helpers
export const RedisKeys = {
  winners: () => 'winners',
  player: (playerId: string) => `player:${playerId}`,
  leaderboard: () => 'leaderboard',
} as const;
