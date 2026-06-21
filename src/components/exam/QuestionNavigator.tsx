"use client";

import type { AnswersMap } from "@/lib/types";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answers: AnswersMap;
  flagged: number[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  total,
  currentIndex,
  answers,
  flagged,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <nav aria-label="Questions" className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
      <div className="grid max-h-64 grid-cols-5 gap-1.5 overflow-y-auto">
        {Array.from({ length: total }, (_, i) => {
          const id = i + 1;
          const answered = answers[id] !== null && answers[id] !== undefined;
          const isCurrent = i === currentIndex;
          const isFlagged = flagged.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(i)}
              className={`relative h-9 rounded-lg text-xs font-semibold transition ${
                isCurrent
                  ? "bg-blue-500 text-white ring-2 ring-blue-300"
                  : answered
                    ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-600/40"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {id}
              {isFlagged && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
