"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured, loadAllAttempts } from "@/lib/supabase/client";
import { EXAM_ITEM_COUNT, type AttemptSummary, type ExamSession } from "@/lib/types";

const ACCESS_KEY = process.env.NEXT_PUBLIC_ATTEMPTS_KEY;
const STORAGE_KEY = "mathquiz_attempts_key";

type StatusFilter = "all" | ExamSession["status"];

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

function statusClass(status: ExamSession["status"]): string {
  if (status === "in_progress") return "bg-amber-900/40 text-amber-200";
  if (status === "completed") return "bg-emerald-900/40 text-emerald-200";
  return "bg-slate-700 text-slate-300";
}

export function AttemptsView() {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [unlocked, setUnlocked] = useState(!ACCESS_KEY);

  useEffect(() => {
    if (!ACCESS_KEY) return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === ACCESS_KEY) setUnlocked(true);
  }, []);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError("");
    const rows = await loadAllAttempts();
    if (!rows.length && !isSupabaseConfigured()) {
      setError("Supabase is not configured.");
    }
    setAttempts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    void fetchAttempts();
  }, [unlocked, fetchAttempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return attempts.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });
  }, [attempts, filter, query]);

  const stats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === "completed");
    const avgScore =
      completed.length && completed.some((a) => a.score !== undefined)
        ? Math.round(
            completed.reduce((sum, a) => sum + (a.score ?? 0), 0) / completed.length,
          )
        : null;
    return {
      total: attempts.length,
      inProgress: attempts.filter((a) => a.status === "in_progress").length,
      completed: completed.length,
      avgScore,
    };
  }, [attempts]);

  const unlock = () => {
    if (accessKey === ACCESS_KEY) {
      sessionStorage.setItem(STORAGE_KEY, accessKey);
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Invalid access key.");
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-sm">
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            Home
          </Link>
          <h1 className="mt-6 text-xl font-semibold">Attempts</h1>
          <p className="mt-2 text-sm text-slate-400">Enter the access key to view attempts.</p>
          <input
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            placeholder="Access key"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={unlock}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-blue-400 hover:underline">
              Home
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Exam attempts</h1>
            <p className="mt-1 text-sm text-slate-400">
              {stats.total} total · {stats.inProgress} in progress · {stats.completed} completed
              {stats.avgScore !== null && ` · ${stats.avgScore}% avg score`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchAttempts()}
            disabled={loading}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No attempts found.
                  </td>
                </tr>
              ) : (
                filtered.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b border-slate-800/80 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3 font-medium">{attempt.studentName}</td>
                    <td className="px-4 py-3 text-slate-400">{attempt.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusClass(attempt.status)}`}
                      >
                        {statusLabel(attempt.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {attempt.status === "completed" && attempt.correctCount !== undefined
                        ? `${attempt.correctCount}/${EXAM_ITEM_COUNT} correct`
                        : `${attempt.answeredCount}/${EXAM_ITEM_COUNT} answered`}
                    </td>
                    <td className="px-4 py-3">
                      {attempt.status === "completed" && attempt.score !== undefined ? (
                        <Link
                          href={`/results/${attempt.id}`}
                          className="font-medium text-blue-400 hover:underline"
                        >
                          {attempt.score}%
                        </Link>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatWhen(attempt.startedAt)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatWhen(attempt.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
