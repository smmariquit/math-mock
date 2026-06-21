export type Topic =
  | "number_sense"
  | "algebra"
  | "geometry"
  | "trigonometry"
  | "statistics"
  | "functions";

export type VisualizationType =
  | "none"
  | "triangle"
  | "coordinate"
  | "bar_chart"
  | "circle"
  | "matter_projectile";

export interface Question {
  id: number;
  topic: Topic;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  visualization: VisualizationType;
  vizData?: Record<string, number | number[] | string>;
}

export type AnswersMap = Record<number, number | null>;

export interface ExamSession {
  id: string;
  studentName: string;
  email: string;
  status: "in_progress" | "completed" | "expired";
  seed: number;
  timeLimitSeconds: number;
  timeRemainingSeconds: number;
  startedAt: string;
  currentIndex: number;
  answers: AnswersMap;
  flagged: number[];
  score?: number;
  correctCount?: number;
  topicBreakdown?: Record<Topic, { correct: number; total: number }>;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  number_sense: "Number Sense",
  algebra: "Algebra",
  geometry: "Geometry",
  trigonometry: "Trigonometry",
  statistics: "Statistics & Probability",
  functions: "Functions & Sequences",
};

export const EXAM_ITEM_COUNT = 100;
export const EXAM_TIME_SECONDS = 3 * 60 * 60; // 3 hours — typical mock exam length
