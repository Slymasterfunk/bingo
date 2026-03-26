'use client';

import { SquareState } from '@/lib/types';

interface BingoSquareProps {
  square: SquareState;
  onClick: () => void;
  isWinning?: boolean;
}

export default function BingoSquare({ square, onClick, isWinning = false }: BingoSquareProps) {
  const isFreeSpace = square.prompt === "FREE SPACE";

  return (
    <button
      onClick={onClick}
      disabled={isFreeSpace}
      className={`
        relative aspect-square p-2 rounded-lg border-2 transition-all duration-300
        flex flex-col items-center justify-center text-center
        min-h-[80px] sm:min-h-[100px]
        ${isFreeSpace
          ? 'bg-purple-500 text-white border-purple-600 cursor-default'
          : square.marked
            ? isWinning
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 border-yellow-600 shadow-lg'
              : 'bg-gradient-to-br from-green-400 to-blue-500 text-white border-blue-600'
            : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-400 active:scale-95'
        }
      `}
    >
      <span className={`text-xs sm:text-sm font-medium ${isFreeSpace ? 'text-lg font-bold' : ''}`}>
        {square.prompt}
      </span>

      {square.marked && square.personName && !isFreeSpace && (
        <span className="mt-1 text-xs font-semibold truncate w-full px-1">
          {square.personName}
        </span>
      )}

      {isFreeSpace && (
        <span className="text-2xl mt-1">★</span>
      )}
    </button>
  );
}
