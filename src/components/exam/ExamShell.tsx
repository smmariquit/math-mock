"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { useExamStore } from "@/lib/exam/store";
import { countAnswered } from "@/lib/scoring";
import { EXAM_ITEM_COUNT } from "@/lib/types";

export function ExamShell() {
  const router = useRouter();
  const {
    session,
    questions,
    hydrated,
    resumeExam,
    setAnswer,
    setCurrentIndex,
    toggleFlag,
    tickTimer,
    submitExam,
    persist,
  } = useExamStore();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      void resumeExam().then((s) => {
        if (!s) router.replace("/");
      });
    }
  }, [hydrated, resumeExam, router]);

  useEffect(() => {
    if (!session || session.status !== "in_progress") return;
    const id = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(id);
  }, [session, tickTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void persist();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persist]);

  if (!hydrated || !session || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading exam…
      </div>
    );
  }

  if (session.status === "completed" || session.status === "expired") {
    router.replace(`/results/${session.id}`);
    return null;
  }

  const q = questions[session.currentIndex]!;
  const answered = countAnswered(session.answers);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm text-slate-200">{session.studentName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-slate-500">
              {answered}/{EXAM_ITEM_COUNT}
            </div>
            <ExamTimer seconds={session.timeRemainingSeconds} />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${(answered / EXAM_ITEM_COUNT) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        <section>
          <QuestionCard
            question={q}
            selected={session.answers[q.id]}
            flagged={session.flagged.includes(q.id)}
            onSelect={(i) => setAnswer(q.id, i)}
            onToggleFlag={() => toggleFlag(q.id)}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={session.currentIndex === 0}
              onClick={() => setCurrentIndex(session.currentIndex - 1)}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Item {session.currentIndex + 1} of {EXAM_ITEM_COUNT}
            </span>
            {session.currentIndex < EXAM_ITEM_COUNT - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(session.currentIndex + 1)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
              >
                Submit Exam
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <QuestionNavigator
            total={EXAM_ITEM_COUNT}
            currentIndex={session.currentIndex}
            answers={session.answers}
            flagged={session.flagged}
            onNavigate={setCurrentIndex}
          />
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full rounded-xl border border-emerald-600/50 bg-emerald-600/10 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/20"
          >
            Submit
          </button>
        </aside>
      </main>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Submit?</h2>
            <p className="mt-2 text-sm text-slate-400">
              {answered}/{EXAM_ITEM_COUNT} answered. Unanswered items count as wrong.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm font-medium"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowSubmitConfirm(false);
                  await submitExam();
                  router.push(`/results/${session.id}`);
                }}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
