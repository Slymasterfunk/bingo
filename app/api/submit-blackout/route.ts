import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, Winner, SquareState } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, cardState } = body;

    // Validate fields
    if (!playerId || !playerName || !cardState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ OPTIMIZATION: Server-side validation - all squares marked
    const allMarked = cardState.every((square: SquareState) => square.marked);

    if (!allMarked) {
      return NextResponse.json(
        { success: false, message: 'Not all squares are completed' },
        { status: 400 }
      );
    }

    // Check if prize already claimed
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    if (winners.blackout) {
      return NextResponse.json({
        success: false,
        isWinner: false,
        message: `${winners.blackout.playerName} already won the blackout prize!`,
      });
    }

    // Claim the prize
    const winner: Winner = {
      playerId,
      playerName,
      timestamp: Date.now(),
    };

    winners.blackout = winner;
    await redis.set(RedisKeys.winners(), JSON.stringify(winners));

    return NextResponse.json({
      success: true,
      isWinner: true,
      message: '🎊 BLACKOUT! You won the grand prize! 🎊',
    });
  } catch (error) {
    console.error('Error claiming blackout prize:', error);
    return NextResponse.json(
      { error: 'Failed to claim prize' },
      { status: 500 }
    );
  }
}
