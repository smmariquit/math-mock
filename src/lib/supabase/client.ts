import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AnswersMap, AttemptSummary, ExamSession } from "../types";
import { countAnswered } from "../scoring";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

interface DbRow {
  id: string;
  student_name: string;
  email: string;
  status: ExamSession["status"];
  seed: number;
  time_limit_seconds: number;
  time_remaining_seconds: number;
  started_at: string;
  current_index: number;
  answers: AnswersMap;
  flagged: number[];
  score: number | null;
  correct_count: number | null;
  topic_breakdown: ExamSession["topicBreakdown"] | null;
}

function rowToSession(row: DbRow): ExamSession {
  return {
    id: row.id,
    studentName: row.student_name,
    email: row.email,
    status: row.status,
    seed: row.seed,
    timeLimitSeconds: row.time_limit_seconds,
    timeRemainingSeconds: row.time_remaining_seconds,
    startedAt: row.started_at,
    currentIndex: row.current_index,
    answers: row.answers ?? {},
    flagged: row.flagged ?? [],
    score: row.score ?? undefined,
    correctCount: row.correct_count ?? undefined,
    topicBreakdown: row.topic_breakdown ?? undefined,
  };
}

interface DbListRow {
  id: string;
  student_name: string;
  email: string;
  status: ExamSession["status"];
  score: number | null;
  correct_count: number | null;
  answers: AnswersMap;
  started_at: string;
  updated_at: string;
}

function rowToAttemptSummary(row: DbListRow): AttemptSummary {
  return {
    id: row.id,
    studentName: row.student_name,
    email: row.email,
    status: row.status,
    score: row.score ?? undefined,
    correctCount: row.correct_count ?? undefined,
    answeredCount: countAnswered(row.answers ?? {}),
    startedAt: row.started_at,
    updatedAt: row.updated_at,
  };
}

export async function loadAllAttempts(): Promise<AttemptSummary[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("exam_sessions")
    .select(
      "id, student_name, email, status, score, correct_count, answers, started_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbListRow[]).map(rowToAttemptSummary);
}

export async function createSession(
  studentName: string,
  email: string,
  seed: number,
  timeLimitSeconds: number,
): Promise<ExamSession | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("exam_sessions")
    .insert({
      student_name: studentName,
      email: normalizeEmail(email),
      seed,
      time_limit_seconds: timeLimitSeconds,
      time_remaining_seconds: timeLimitSeconds,
      answers: {},
      flagged: [],
    })
    .select()
    .single();

  if (error || !data) return null;
  return rowToSession(data as DbRow);
}

export async function loadSession(id: string): Promise<ExamSession | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToSession(data as DbRow);
}

export async function loadActiveSessionByEmail(email: string): Promise<ExamSession | null> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("email", normalized)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return rowToSession(data as DbRow);
  }

  const local = loadLocalBackup();
  if (local?.email === normalized && local.status === "in_progress") {
    return local;
  }

  return null;
}

export async function saveSession(session: ExamSession): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("exam_sessions")
    .update({
      student_name: session.studentName,
      email: normalizeEmail(session.email),
      status: session.status,
      time_remaining_seconds: session.timeRemainingSeconds,
      current_index: session.currentIndex,
      answers: session.answers,
      flagged: session.flagged,
      score: session.score ?? null,
      correct_count: session.correctCount ?? null,
      topic_breakdown: session.topicBreakdown ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.id);

  return !error;
}

export const LOCAL_SESSION_KEY = "mathquiz_session_id";
export const LOCAL_EMAIL_KEY = "mathquiz_email";
export const LOCAL_BACKUP_KEY = "mathquiz_session_backup";

export function saveLocalBackup(session: ExamSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_SESSION_KEY, session.id);
  localStorage.setItem(LOCAL_EMAIL_KEY, normalizeEmail(session.email));
  localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(session));
}

export function loadLocalBackup(): ExamSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as ExamSession;
    if (!session.email) return null;
    return session;
  } catch {
    return null;
  }
}

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_SESSION_KEY);
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_EMAIL_KEY);
}

export function clearLocalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem(LOCAL_EMAIL_KEY);
  localStorage.removeItem(LOCAL_BACKUP_KEY);
}
