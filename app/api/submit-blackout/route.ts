import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, Winner, SquareState } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, cardState } = body;

    // Validate required fields
    if (!playerId || !playerName || !cardState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Server-side validation: Verify ALL 25 squares are marked
    const allMarked = cardState.every((square: SquareState) => square.marked);

    if (!allMarked) {
      return NextResponse.json(
        { error: 'Not all squares are marked for blackout' },
        { status: 400 }
      );
    }

    if (cardState.length !== 25) {
      return NextResponse.json(
        { error: 'Invalid card state: must have exactly 25 squares' },
        { status: 400 }
      );
    }

    // Atomic check: Get current winners and check if blackout is already claimed
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Check if prize already claimed
    if (winners.blackout) {
      return NextResponse.json({
        success: false,
        isWinner: false,
        message: `${winners.blackout.playerName} already claimed the blackout prize!`,
        winner: winners.blackout,
      });
    }

    // Claim the prize!
    const newWinner: Winner = {
      playerId,
      playerName,
      timestamp: Date.now(),
    };

    winners.blackout = newWinner;
    await redis.set(RedisKeys.winners(), JSON.stringify(winners));

    return NextResponse.json({
      success: true,
      isWinner: true,
      message: 'Congratulations! You got a BLACKOUT! 🎊🎉',
    });
  } catch (error) {
    console.error('Error submitting blackout:', error);
    return NextResponse.json(
      { error: 'Failed to submit blackout' },
      { status: 500 }
    );
  }
}
