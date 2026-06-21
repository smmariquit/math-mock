"use client";

import { useEffect, useState } from "react";
import { useExamStore } from "@/lib/exam/store";
import { getStoredEmail, isValidEmail } from "@/lib/supabase/client";
import { EXAM_ITEM_COUNT, EXAM_TIME_SECONDS } from "@/lib/types";
import { formatDuration } from "@/lib/scoring";

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"start" | "restore" | null>(null);
  const [error, setError] = useState("");
  const initNewExam = useExamStore((s) => s.initNewExam);
  const restoreByEmail = useExamStore((s) => s.restoreByEmail);

  useEffect(() => {
    const stored = getStoredEmail();
    if (stored) setEmail(stored);
  }, []);

  const canSubmit = name.trim() && isValidEmail(email);

  const startExam = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading("start");
    await initNewExam(name.trim(), email);
    window.location.href = "/exam";
  };

  const restoreExam = async () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setLoading("restore");
    const session = await restoreByEmail(email);
    if (!session) {
      setLoading(null);
      setError("No exam in progress for this email.");
      return;
    }
    window.location.href = "/exam";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Math Mock Exam</h1>
        <p className="mt-2 text-sm text-slate-400">
          {EXAM_ITEM_COUNT} items · {formatDuration(EXAM_TIME_SECONDS)}
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-slate-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Used to restore progress on any device.</p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canSubmit || loading !== null}
            onClick={() => void startExam()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading === "start" ? "Starting…" : "Start"}
          </button>
          <button
            type="button"
            disabled={!isValidEmail(email) || loading !== null}
            onClick={() => void restoreExam()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 disabled:opacity-50"
          >
            {loading === "restore" ? "Restoring…" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
