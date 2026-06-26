import type { ExamId } from "../types";
import { buildExamQuestions } from "./bank";
import { advancedGenerators } from "./generator-advanced";
import { standardGenerators } from "./generator-standard";
import { EXAM_ITEM_COUNT } from "../types";

export { gcd, lcm } from "./utils";

export function generateExamQuestions(
  examId: ExamId,
  seed: number,
  count = EXAM_ITEM_COUNT,
) {
  const bank = examId === "advanced" ? advancedGenerators : standardGenerators;
  return buildExamQuestions(bank, seed, count);
}

export type { QuestionDraft, Generator } from "./bank";
