'use client';

interface ProgressTrackerProps {
  completedSquares: number;
  totalSquares: number;
}

export default function ProgressTracker({ completedSquares, totalSquares }: ProgressTrackerProps) {
  const percentage = Math.round((completedSquares / totalSquares) * 100);

  return (
    <div className="progress-tracker">
      <p className="progress-tracker__text">
        Progress: <span className="progress-tracker__count">{completedSquares}/{totalSquares}</span> squares ({percentage}%)
      </p>
    </div>
  );
}
