import type { Question, Topic } from "../types";
import { attachHints } from "./hints";
import { createSeededRandom, shuffleWithRng } from "./utils";

export type QuestionDraft = Omit<Question, "hints"> & { hints?: string[] };
export type Generator = (rng: () => number, id: number) => QuestionDraft;

function questionFingerprint(q: QuestionDraft): string {
  return `${q.prompt}::${q.options[q.correctIndex]}`;
}

export function buildExamQuestions(
  generators: { topic: Topic; fn: Generator }[],
  seed: number,
  count: number,
): Question[] {
  const rng = createSeededRandom(seed);
  const questions: Question[] = [];
  const seen = new Set<string>();

  const slots = Array.from({ length: count }, (_, i) => i % generators.length);
  const shuffledSlots = shuffleWithRng(rng, slots);

  for (let i = 0; i < count; i += 1) {
    const baseGenIndex = shuffledSlots[i]!;
    let attempt = 0;
    let question: QuestionDraft | null = null;

    while (attempt < 64 && !question) {
      const genIndex = (baseGenIndex + attempt) % generators.length;
      const { topic, fn } = generators[genIndex]!;
      const qSeed = seed + i * 9973 + attempt * 7919 + genIndex * 131;
      const candidate = { ...fn(createSeededRandom(qSeed), i + 1), id: i + 1, topic };
      const fp = questionFingerprint(candidate);

      if (!seen.has(fp)) {
        seen.add(fp);
        question = candidate;
      }
      attempt += 1;
    }

    if (!question) {
      const { topic, fn } = generators[baseGenIndex]!;
      const qSeed = seed + i * 9973 + 999983;
      question = { ...fn(createSeededRandom(qSeed), i + 1), id: i + 1, topic };
    }

    questions.push(attachHints(question));
  }

  return questions;
}
