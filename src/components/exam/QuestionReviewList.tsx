"use client";

import { useMemo, useState } from "react";
import { Latex } from "@/components/Latex";
import { TOPIC_LABELS, type ExamSession, type Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

type ReviewFilter = "all" | "wrong" | "correct" | "unanswered" | "flagged";

interface QuestionReviewListProps {
  questions: Question[];
  session: ExamSession;
  showExplanation?: boolean;
}

function optionLabel(index: number | null | undefined): string | null {
  if (index === null || index === undefined) return null;
  return LETTERS[index] ?? String(index);
}

export function QuestionReviewList({
  questions,
  session,
  showExplanation = false,
}: QuestionReviewListProps) {
  const [filter, setFilter] = useState<ReviewFilter>("all");

  const rows = useMemo(() => {
    return questions.map((q) => {
      const selected = session.answers[q.id];
      const answered = selected !== null && selected !== undefined;
      const isCorrect = answered && selected === q.correctIndex;
      const flagged = session.flagged.includes(q.id);
      return { q, selected, answered, isCorrect, flagged };
    });
  }, [questions, session]);

  const counts = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    for (const row of rows) {
      if (!row.answered) unanswered += 1;
      else if (row.isCorrect) correct += 1;
      else wrong += 1;
    }
    return {
      correct,
      wrong,
      unanswered,
      flagged: session.flagged.length,
    };
  }, [rows, session.flagged.length]);

  const filtered = useMemo(() => {
    return rows.filter(({ answered, isCorrect, flagged }) => {
      if (filter === "correct") return answered && isCorrect;
      if (filter === "wrong") return answered && !isCorrect;
      if (filter === "unanswered") return !answered;
      if (filter === "flagged") return flagged;
      return true;
    });
  }, [rows, filter]);

  const filters: { id: ReviewFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: questions.length },
    { id: "wrong", label: "Wrong", count: counts.wrong },
    { id: "correct", label: "Correct", count: counts.correct },
    { id: "unanswered", label: "Unanswered", count: counts.unanswered },
    { id: "flagged", label: "Flagged", count: counts.flagged },
  ];

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-300">Questions</h2>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filter === f.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No questions in this filter.</p>
        ) : (
          filtered.map(({ q, selected, answered, isCorrect, flagged }) => (
            <div
              key={q.id}
              className={`rounded-lg border p-4 ${
                !answered
                  ? "border-slate-700 bg-slate-950/30"
                  : isCorrect
                    ? "border-emerald-800/50 bg-emerald-950/20"
                    : "border-red-800/50 bg-red-950/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>#{q.id}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5">{TOPIC_LABELS[q.topic]}</span>
                  {flagged && (
                    <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-300">Flagged</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    !answered
                      ? "text-slate-500"
                      : isCorrect
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {!answered ? "Unanswered" : isCorrect ? "Correct" : "Wrong"}
                </span>
              </div>

              <div className="mt-2 text-sm leading-relaxed text-slate-100">
                <Latex>{q.prompt}</Latex>
              </div>

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-md bg-slate-950/50 px-3 py-2">
                  <p className="text-slate-500">Their answer</p>
                  <p className="mt-1 text-slate-200">
                    {answered ? (
                      <>
                        <span className="font-medium">{optionLabel(selected)}.</span>{" "}
                        <Latex>{q.options[selected!]}</Latex>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="rounded-md bg-slate-950/50 px-3 py-2">
                  <p className="text-slate-500">Correct answer</p>
                  <p className="mt-1 text-slate-200">
                    <span className="font-medium">{optionLabel(q.correctIndex)}.</span>{" "}
                    <Latex>{q.options[q.correctIndex]}</Latex>
                  </p>
                </div>
              </div>

              {showExplanation && !isCorrect && (
                <p className="mt-2 text-xs text-slate-400">
                  <span className="text-slate-500">Explanation: </span>
                  <Latex>{q.explanation}</Latex>
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
