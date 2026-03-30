'use client';

import { SquareState } from '@/lib/types';

interface BingoSquareProps {
  square: SquareState;
  onClick: () => void;
  isWinning?: boolean;
}

export default function BingoSquare({ square, onClick, isWinning = false }: BingoSquareProps) {
  const isFreeSpace = square.prompt === "FREE SPACE";

  // Build class names using BEM methodology
  const classNames = [
    'bingo-square',
    isFreeSpace && 'bingo-square--free',
    square.marked && 'bingo-square--marked',
    isWinning && 'bingo-square--winning',
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={isFreeSpace}
      className={classNames}
    >
      <span className="bingo-square__prompt">
        {square.prompt}
      </span>

      {square.marked && square.personName && !isFreeSpace && (
        <span className="bingo-square__name">
          {square.personName}
        </span>
      )}

      {isFreeSpace && (
        <span className="text-2xl mt-1">★</span>
      )}
    </button>
  );
}
