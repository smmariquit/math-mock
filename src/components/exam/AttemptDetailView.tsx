"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionReviewList } from "@/components/exam/QuestionReviewList";
import { generateExamQuestions } from "@/lib/questions/generator";
import { loadSession } from "@/lib/supabase/client";
import { countAnswered, formatDuration, scoreExam } from "@/lib/scoring";
import {
  EXAM_ITEM_COUNT,
  TOPIC_LABELS,
  type ExamSession,
  type Topic,
} from "@/lib/types";

interface AttemptDetailViewProps {
  sessionId: string;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: ExamSession["status"]): string {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Expired";
}

export function AttemptDetailView({ sessionId }: AttemptDetailViewProps) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      const s = await loadSession(sessionId);
      if (!s) {
        setError("Attempt not found.");
        setSession(null);
      } else {
        setSession(s);
      }
      setLoading(false);
    }
    void load();
  }, [sessionId]);

  const questions = useMemo(
    () => (session ? generateExamQuestions(session.seed, EXAM_ITEM_COUNT) : []),
    [session],
  );

  const computed = useMemo(() => {
    if (!session || questions.length === 0) return null;
    return scoreExam(questions, session.answers);
  }, [session, questions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading attempt…
      </div>
    );
  }

  if (!session || error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-400">{error || "Attempt not found."}</p>
          <Link href="/attempts" className="mt-4 inline-block text-sm text-blue-400 hover:underline">
            Back to attempts
          </Link>
        </div>
      </div>
    );
  }

  const answered = countAnswered(session.answers);
  const score = session.score ?? computed?.score;
  const correctCount = session.correctCount ?? computed?.correctCount;
  const topicBreakdown = session.topicBreakdown ?? computed?.topicBreakdown;
  const wrongCount = answered - (correctCount ?? 0);
  const unanswered = EXAM_ITEM_COUNT - answered;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/attempts" className="text-sm text-blue-400 hover:underline">
          All attempts
        </Link>

        <header className="mt-6 rounded-lg border border-slate-700 bg-slate-900/80 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{session.studentName}</h1>
              <p className="mt-1 text-sm text-slate-400">{session.email}</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {statusLabel(session.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {score !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Score</p>
                <p className="text-2xl font-bold">{score}%</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500">Correct</p>
              <p className="text-2xl font-bold text-emerald-400">{correctCount ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Wrong</p>
              <p className="text-2xl font-bold text-red-400">{answered ? wrongCount : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unanswered</p>
              <p className="text-2xl font-bold text-slate-400">{unanswered}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 border-t border-slate-700/80 pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Answered</dt>
              <dd>{answered}/{EXAM_ITEM_COUNT}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Flagged</dt>
              <dd>{session.flagged.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Time remaining</dt>
              <dd>{formatDuration(session.timeRemainingSeconds)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Current question</dt>
              <dd>{session.status === "in_progress" ? session.currentIndex + 1 : "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Started</dt>
              <dd>{formatWhen(session.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Session ID</dt>
              <dd className="truncate font-mono text-xs text-slate-400">{session.id}</dd>
            </div>
          </dl>
        </header>

        {topicBreakdown && (
          <section className="mt-6 rounded-lg border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-sm font-medium text-slate-300">By topic</h2>
            <div className="space-y-3">
              {(Object.entries(topicBreakdown) as [Topic, { correct: number; total: number }][]).map(
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

        <div className="mt-6">
          <QuestionReviewList questions={questions} session={session} showExplanation />
        </div>
      </div>
    </div>
  );
}
