import type { AnswersMap, Question, Topic } from "./types";

export function scoreExam(questions: Question[], answers: AnswersMap) {
  let correctCount = 0;
  const topicBreakdown: Record<Topic, { correct: number; total: number }> = {
    number_sense: { correct: 0, total: 0 },
    algebra: { correct: 0, total: 0 },
    geometry: { correct: 0, total: 0 },
    trigonometry: { correct: 0, total: 0 },
    statistics: { correct: 0, total: 0 },
    functions: { correct: 0, total: 0 },
    abstract_reasoning: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    topicBreakdown[q.topic].total += 1;
    const selected = answers[q.id];
    if (selected === q.correctIndex) {
      correctCount += 1;
      topicBreakdown[q.topic].correct += 1;
    }
  }

  const score = Math.round((correctCount / questions.length) * 100);

  return { score, correctCount, topicBreakdown };
}

export function countAnswered(answers: AnswersMap): number {
  return Object.values(answers).filter((v) => v !== null && v !== undefined).length;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
