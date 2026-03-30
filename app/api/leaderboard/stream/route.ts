import { redis, RedisKeys } from '@/lib/redis';
import { Winners, PlayerProgress } from '@/lib/types';

// Use Edge Runtime for streaming support
export const runtime = 'edge';

// Helper to format SSE messages
function formatSSE(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Helper to get current leaderboard data
async function getLeaderboardData() {
  try {
    // Get winners
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Get leaderboard IDs
    const leaderboardIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1,
      { rev: true }
    ) as string[];

    // Batch fetch all players
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

    return { winners, players };
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return null;
  }
}

export async function GET(request: Request) {
  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial leaderboard data
      const initialData = await getLeaderboardData();
      if (initialData) {
        controller.enqueue(encoder.encode(formatSSE({ type: 'initial', data: initialData })));
      }

      // Subscribe to Redis pub/sub for updates
      // Note: Upstash Redis REST API doesn't support traditional pub/sub
      // So we'll use polling with short intervals as a fallback
      const pollInterval = setInterval(async () => {
        try {
          const data = await getLeaderboardData();
          if (data) {
            controller.enqueue(encoder.encode(formatSSE({ type: 'update', data })));
          }
        } catch (error) {
          console.error('Error polling leaderboard:', error);
        }
      }, 2000); // Poll every 2 seconds

      // Send heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000); // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}
