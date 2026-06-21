"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Latex } from "@/components/Latex";
import { generateExamQuestions } from "@/lib/questions/generator";
import { loadLocalBackup, loadSession } from "@/lib/supabase/client";
import { TOPIC_LABELS, type ExamSession, type Topic } from "@/lib/types";
import { EXAM_ITEM_COUNT } from "@/lib/types";

interface ResultsViewProps {
  sessionId: string;
}

export function ResultsView({ sessionId }: ResultsViewProps) {
  const [session, setSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    async function load() {
      let s = await loadSession(sessionId);
      if (!s) {
        const local = loadLocalBackup();
        if (local?.id === sessionId) s = local;
      }
      setSession(s);
    }
    void load();
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading results…
      </div>
    );
  }

  const questions = generateExamQuestions(session.seed, EXAM_ITEM_COUNT);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-blue-400 hover:underline">
          Home
        </Link>

        <header className="mt-6 rounded-lg border border-slate-700 bg-slate-900/80 p-6">
          <h1 className="text-xl font-semibold">{session.studentName}</h1>
          <div className="mt-4 flex gap-8">
            <p className="text-3xl font-bold">{session.score}%</p>
            <p className="text-sm text-slate-400">
              {session.correctCount}/{EXAM_ITEM_COUNT} correct
            </p>
          </div>
        </header>

        {session.topicBreakdown && (
          <section className="mt-6 rounded-lg border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-sm font-medium text-slate-300">By topic</h2>
            <div className="space-y-3">
              {(Object.entries(session.topicBreakdown) as [Topic, { correct: number; total: number }][]).map(
                ([topic, stats]) => {
                  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={topic}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{TOPIC_LABELS[topic]}</span>
                        <span className="text-slate-400">
                          {stats.correct}/{stats.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-sm font-medium text-slate-300">Review</h2>
          <div className="max-h-[480px] space-y-3 overflow-y-auto">
            {questions.map((q) => {
              const selected = session.answers[q.id];
              const correct = selected === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg border p-3 ${
                    correct
                      ? "border-emerald-800/50"
                      : selected === null || selected === undefined
                        ? "border-slate-700"
                        : "border-red-800/50"
                  }`}
                >
                  <p className="text-xs text-slate-500">{q.id}</p>
                  <div className="mt-1 text-sm">
                    <Latex>{q.prompt}</Latex>
                  </div>
                  {!correct && (
                    <p className="mt-2 text-xs text-slate-400">
                      Answer: <Latex>{q.options[q.correctIndex]}</Latex>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
