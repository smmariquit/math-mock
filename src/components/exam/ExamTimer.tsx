"use client";

import { formatDuration } from "@/lib/scoring";

interface ExamTimerProps {
  seconds: number;
  warning?: boolean;
}

export function ExamTimer({ seconds, warning }: ExamTimerProps) {
  const urgent = seconds <= 600;
  return (
    <div
      className={`font-mono text-lg tabular-nums ${urgent || warning ? "text-red-400" : "text-emerald-400"}`}
      aria-live="polite"
      aria-label={`Time remaining: ${formatDuration(seconds)}`}
    >
      {formatDuration(seconds)}
    </div>
  );
}
