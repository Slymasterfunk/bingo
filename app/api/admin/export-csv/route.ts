import { NextResponse } from 'next/server';
import { redis, RedisKeys } from '@/lib/redis';
import { Winners, PlayerProgress } from '@/lib/types';

export async function GET() {
  try {
    // Get winners
    const winnersData = await redis.get(RedisKeys.winners());
    const winners: Winners = winnersData
      ? (typeof winnersData === 'string' ? JSON.parse(winnersData) : winnersData)
      : { firstRow: null, blackout: null };

    // Get all players from leaderboard
    const playerIds = await redis.zrange(
      RedisKeys.leaderboard(),
      0,
      -1,
      { rev: true }
    ) as string[];

    // Fetch player data
    const players: PlayerProgress[] = [];
    for (const playerId of playerIds) {
      const playerData = await redis.get(RedisKeys.player(playerId));
      if (playerData) {
        const player: PlayerProgress = typeof playerData === 'string'
          ? JSON.parse(playerData)
          : playerData;
        players.push(player);
      }
    }

    // Generate CSV content
    const csvRows: string[] = [];

    // Header row
    csvRows.push('Player Name,Player ID,Completed Squares,Has Row,Has Blackout,First Row Winner,Blackout Winner,Last Update');

    // Data rows
    players.forEach(player => {
      const isFirstRowWinner = winners.firstRow?.playerId === player.playerId;
      const isBlackoutWinner = winners.blackout?.playerId === player.playerId;

      csvRows.push([
        `"${player.playerName}"`,
        player.playerId,
        player.completedSquares.toString(),
        player.hasRow ? 'Yes' : 'No',
        player.hasBlackout ? 'Yes' : 'No',
        isFirstRowWinner ? 'Yes' : 'No',
        isBlackoutWinner ? 'Yes' : 'No',
        new Date(player.lastUpdate).toISOString(),
      ].join(','));
    });

    // Add summary section
    csvRows.push('');
    csvRows.push('Summary');
    csvRows.push(`Total Players,${players.length}`);
    csvRows.push(`Players with Row,${players.filter(p => p.hasRow).length}`);
    csvRows.push(`Players with Blackout,${players.filter(p => p.hasBlackout).length}`);

    if (winners.firstRow) {
      csvRows.push('');
      csvRows.push('First Row Winner');
      csvRows.push(`Name,"${winners.firstRow.playerName}"`);
      csvRows.push(`Time,${new Date(winners.firstRow.timestamp).toISOString()}`);
    }

    if (winners.blackout) {
      csvRows.push('');
      csvRows.push('Blackout Winner');
      csvRows.push(`Name,"${winners.blackout.playerName}"`);
      csvRows.push(`Time,${new Date(winners.blackout.timestamp).toISOString()}`);
    }

    const csvContent = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bingo-results-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
