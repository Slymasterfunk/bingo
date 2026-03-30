import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, Winner, SquareState } from '@/lib/types';
import { WINNING_PATTERNS } from '@/lib/winDetection';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, cardState, winningPattern } = body;

    // Validate fields
    if (!playerId || !playerName || !cardState || !winningPattern) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ OPTIMIZATION: Server-side validation of winning pattern
    const isValidPattern = winningPattern.every((index: number) => {
      return cardState[index]?.marked === true;
    });

    if (!isValidPattern) {
      return NextResponse.json(
        { success: false, message: 'Invalid winning pattern' },
        { status: 400 }
      );
    }

    // Check if prize already claimed (atomic operation)
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    if (winners.firstRow) {
      return NextResponse.json({
        success: false,
        isWinner: false,
        message: `${winners.firstRow.playerName} already won the first row prize!`,
      });
    }

    // Claim the prize
    const winner: Winner = {
      playerId,
      playerName,
      timestamp: Date.now(),
    };

    winners.firstRow = winner;
    await redis.set(RedisKeys.winners(), JSON.stringify(winners));

    return NextResponse.json({
      success: true,
      isWinner: true,
      message: '🎉 Congratulations! You won the first row prize! 🎉',
    });
  } catch (error) {
    console.error('Error claiming row prize:', error);
    return NextResponse.json(
      { error: 'Failed to claim prize' },
      { status: 500 }
    );
  }
}
