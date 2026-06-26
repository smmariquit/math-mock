"use client";

import { create } from "zustand";
import { generateExamQuestions } from "../questions/generator";
import { scoreExam } from "../scoring";
import {
  createSession,
  loadActiveSessionByEmail,
  loadLocalBackup,
  loadSession,
  saveLocalBackup,
  saveSession,
  getStoredSessionId,
} from "../supabase/client";
import { DEFAULT_EXAM_ID } from "../exams/registry";
import type { AnswersMap, ExamId, ExamSession, Question } from "../types";
import { EXAM_ITEM_COUNT, EXAM_TIME_SECONDS } from "../types";

interface ExamState {
  session: ExamSession | null;
  questions: Question[];
  hydrated: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  initNewExam: (
    examId: ExamId,
    studentName: string,
    email: string,
  ) => Promise<"started" | "resumed">;
  restoreByEmail: (examId: ExamId, email: string) => Promise<ExamSession | null>;
  resumeExam: () => Promise<ExamSession | null>;
  setAnswer: (questionId: number, optionIndex: number | null) => void;
  setCurrentIndex: (index: number) => void;
  toggleFlag: (questionId: number) => void;
  tickTimer: () => void;
  submitExam: () => Promise<void>;
  persist: () => Promise<void>;
}

function buildLocalSession(
  examId: ExamId,
  studentName: string,
  email: string,
  seed: number,
): ExamSession {
  const id = crypto.randomUUID();
  return {
    id,
    examId,
    studentName,
    email: email.trim().toLowerCase(),
    status: "in_progress",
    seed,
    timeLimitSeconds: EXAM_TIME_SECONDS,
    timeRemainingSeconds: EXAM_TIME_SECONDS,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    answers: {},
    flagged: [],
  };
}

function hydrateSession(session: ExamSession) {
  const examId = session.examId ?? DEFAULT_EXAM_ID;
  const sessionWithExam = session.examId ? session : { ...session, examId };
  const questions = generateExamQuestions(examId, session.seed, EXAM_ITEM_COUNT);
  saveLocalBackup(sessionWithExam);
  return { session: sessionWithExam, questions, hydrated: true };
}

export const useExamStore = create<ExamState>((set, get) => ({
  session: null,
  questions: [],
  hydrated: false,
  saving: false,
  lastSavedAt: null,

  initNewExam: async (examId, studentName, email) => {
    const existing = await loadActiveSessionByEmail(email, examId);
    if (existing?.status === "in_progress") {
      const session =
        existing.studentName !== studentName
          ? { ...existing, studentName }
          : existing;
      set(hydrateSession(session));
      if (session !== existing) {
        await get().persist();
      }
      return "resumed";
    }

    const seed = Date.now();
    const remote = await createSession(studentName, email, examId, seed, EXAM_TIME_SECONDS);
    const session = remote ?? buildLocalSession(examId, studentName, email, seed);
    set(hydrateSession(session));
    await get().persist();
    return "started";
  },

  restoreByEmail: async (examId, email) => {
    const session = await loadActiveSessionByEmail(email, examId);
    if (!session || session.status !== "in_progress") {
      set({ hydrated: true });
      return null;
    }
    set(hydrateSession(session));
    return session;
  },

  resumeExam: async () => {
    const storedId = getStoredSessionId();
    let session: ExamSession | null = null;

    if (storedId) {
      session = await loadSession(storedId);
    }
    if (!session) {
      session = loadLocalBackup();
    }
    if (!session || session.status !== "in_progress") {
      set({ hydrated: true });
      return null;
    }

    set(hydrateSession(session));
    return session;
  },

  setAnswer: (questionId, optionIndex) => {
    const { session } = get();
    if (!session || session.status !== "in_progress") return;
    const answers: AnswersMap = { ...session.answers, [questionId]: optionIndex };
    const updated = { ...session, answers };
    saveLocalBackup(updated);
    set({ session: updated });
    void get().persist();
  },

  setCurrentIndex: (index) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, currentIndex: index };
    saveLocalBackup(updated);
    set({ session: updated });
    void get().persist();
  },

  toggleFlag: (questionId) => {
    const { session } = get();
    if (!session) return;
    const flagged = session.flagged.includes(questionId)
      ? session.flagged.filter((id) => id !== questionId)
      : [...session.flagged, questionId];
    const updated = { ...session, flagged };
    saveLocalBackup(updated);
    set({ session: updated });
    void get().persist();
  },

  tickTimer: () => {
    const { session } = get();
    if (!session || session.status !== "in_progress") return;
    if (session.timeRemainingSeconds <= 0) return;
    const timeRemainingSeconds = session.timeRemainingSeconds - 1;
    const updated = {
      ...session,
      timeRemainingSeconds,
      status: timeRemainingSeconds <= 0 ? ("expired" as const) : session.status,
    };
    saveLocalBackup(updated);
    set({ session: updated });
    if (timeRemainingSeconds % 15 === 0) {
      void get().persist();
    }
    if (timeRemainingSeconds <= 0) {
      void get().submitExam();
    }
  },

  submitExam: async () => {
    const { session, questions } = get();
    if (!session) return;
    const result = scoreExam(questions, session.answers);
    const updated: ExamSession = {
      ...session,
      status: "completed",
      score: result.score,
      correctCount: result.correctCount,
      topicBreakdown: result.topicBreakdown,
      timeRemainingSeconds: Math.max(0, session.timeRemainingSeconds),
    };
    saveLocalBackup(updated);
    set({ session: updated });
    await saveSession(updated);
  },

  persist: async () => {
    const { session } = get();
    if (!session) return;
    set({ saving: true });
    saveLocalBackup(session);
    const ok = await saveSession(session);
    set({ saving: ok, lastSavedAt: Date.now() });
  },
}));
