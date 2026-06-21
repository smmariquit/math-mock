"use client";

import { useEffect, useState } from "react";
import { Latex } from "@/components/Latex";
import { QuestionVisualization } from "@/components/visualizations/QuestionVisualization";
import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selected: number | null | undefined;
  flagged: boolean;
  onSelect: (index: number) => void;
  onToggleFlag: () => void;
}

export function QuestionCard({
  question,
  selected,
  flagged,
  onSelect,
  onToggleFlag,
}: QuestionCardProps) {
  const letters = ["A", "B", "C", "D"];
  const [openHints, setOpenHints] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setOpenHints(new Set());
  }, [question.id]);

  const toggleHint = (index: number) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <article className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500">{question.id}</span>
          <div className="mt-2 text-lg leading-relaxed text-slate-100">
            <Latex>{question.prompt}</Latex>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFlag}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            flagged
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
              : "bg-slate-800 text-slate-400 hover:text-amber-300"
          }`}
        >
          {flagged ? "Flagged" : "Flag"}
        </button>
      </header>

      {question.visualization !== "none" && (
        <div className="mb-5 rounded-xl bg-slate-950/50 p-3">
          <QuestionVisualization question={question} />
        </div>
      )}

      {question.hints.length > 0 && (
        <section className="mb-5 rounded-xl border border-slate-700/60 bg-slate-950/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hints</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {question.hints.map((_, index) => {
              const isOpen = openHints.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleHint(index)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isOpen
                      ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-amber-200"
                  }`}
                >
                  Hint {index + 1}
                </button>
              );
            })}
          </div>
          {question.hints.map((hint, index) =>
            openHints.has(index) ? (
              <div
                key={index}
                className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm leading-relaxed text-amber-100/90"
              >
                <span className="mr-2 text-xs font-medium text-amber-400/80">
                  Hint {index + 1}:
                </span>
                <Latex>{hint}</Latex>
              </div>
            ) : null,
          )}
        </section>
      )}

      <div className="grid gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-blue-500 bg-blue-500/15 ring-1 ring-blue-500/50"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isSelected ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                }`}
              >
                {letters[i]}
              </span>
              <span className="pt-0.5 text-slate-100">
                <Latex>{opt}</Latex>
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
