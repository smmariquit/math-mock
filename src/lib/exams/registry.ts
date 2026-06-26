import type { ExamId } from "../types";

export type { ExamId };

export interface ExamDefinition {
  id: ExamId;
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
}

export const EXAMS: Record<ExamId, ExamDefinition> = {
  standard: {
    id: "standard",
    title: "Mock Exam 1",
    subtitle: "General review",
    description: "100 mixed items across all junior high topics.",
    topics: ["Number sense", "Algebra", "Geometry", "Trigonometry", "Statistics", "Functions", "Abstract reasoning"],
  },
  advanced: {
    id: "advanced",
    title: "Mock Exam 2",
    subtitle: "Advanced — no easy items",
    description:
      "100 challenging items emphasizing statistics, probability, functions, and multi-step reasoning.",
    topics: [
      "Statistics & data",
      "Probability & counting",
      "Rational & exponential functions",
      "Vieta's identities & inequalities",
      "Linear & quadratic forms",
      "Circle geometry & similarity",
      "Trigonometry",
      "Abstract reasoning",
    ],
  },
};

export const DEFAULT_EXAM_ID: ExamId = "standard";

export function isExamId(value: string): value is ExamId {
  return value === "standard" || value === "advanced";
}

export function getExamLabel(examId: ExamId): string {
  return EXAMS[examId].title;
}
