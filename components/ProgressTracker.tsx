'use client';

interface ProgressTrackerProps {
  completedSquares: number;
  totalSquares: number;
}

export default function ProgressTracker({ completedSquares, totalSquares }: ProgressTrackerProps) {
  const percentage = Math.round((completedSquares / totalSquares) * 100);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {completedSquares}/{totalSquares} squares
        </span>
        <span className="text-sm font-bold text-blue-600">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
