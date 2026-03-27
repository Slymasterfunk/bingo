import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, Winner, SquareState } from '@/lib/types';
import { WINNING_PATTERNS } from '@/lib/winDetection';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, cardState, winningPattern } = body;

    // Validate required fields
    if (!playerId || !playerName || !cardState || !winningPattern) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Server-side validation: Verify the winning pattern is valid
    const isValidPattern = WINNING_PATTERNS.some(
      (pattern) => JSON.stringify(pattern) === JSON.stringify(winningPattern)
    );

    if (!isValidPattern) {
      return NextResponse.json(
        { error: 'Invalid winning pattern' },
        { status: 400 }
      );
    }

    // Verify all squares in the pattern are actually marked
    const allMarked = winningPattern.every((index: number) => {
      const square: SquareState = cardState[index];
      return square && square.marked;
    });

    if (!allMarked) {
      return NextResponse.json(
        { error: 'Not all squares in pattern are marked' },
        { status: 400 }
      );
    }

    // Atomic check: Get current winners and check if firstRow is already claimed
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Check if prize already claimed
    if (winners.firstRow) {
      return NextResponse.json({
        success: false,
        isWinner: false,
        message: `${winners.firstRow.playerName} already claimed the first row prize!`,
        winner: winners.firstRow,
      });
    }

    // Claim the prize!
    const newWinner: Winner = {
      playerId,
      playerName,
      timestamp: Date.now(),
    };

    winners.firstRow = newWinner;
    await redis.set(RedisKeys.winners(), JSON.stringify(winners));

    return NextResponse.json({
      success: true,
      isWinner: true,
      message: 'Congratulations! You\'re the first to get a row! 🎉',
    });
  } catch (error) {
    console.error('Error submitting row:', error);
    return NextResponse.json(
      { error: 'Failed to submit row' },
      { status: 500 }
    );
  }
}
