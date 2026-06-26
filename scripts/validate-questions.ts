import { generateExamQuestions } from "../src/lib/questions/generator";
import type { Question } from "../src/lib/types";

function verifyQuestion(q: Question): string[] {
  const errors: string[] = [];
  const correct = q.options[q.correctIndex];
  if (correct === undefined) errors.push("missing correct option");
  if (new Set(q.options).size !== q.options.length) errors.push("duplicate options");
  if (!q.hints?.length) errors.push("no hints");
  if (q.hints.length > 3) errors.push("too many hints");

  const p = q.prompt;

  if (p.includes("x^2")) {
    if (p.includes("+ -") || p.includes("- -")) errors.push("malformed quadratic constant sign");
    if (/x\^2\s+[0-9]/.test(p)) errors.push("missing operator after x^2");
  }

  if (p.includes("missing leg")) {
    const legM = p.match(/leg \$(\d+)\$/);
    const hypM = p.match(/hypotenuse \$(\d+)\$/);
    if (legM && hypM) {
      const leg = Number(legM[1]);
      const hyp = Number(hypM[1]);
      const expected = String(Math.round(Math.sqrt(hyp * hyp - leg * leg)));
      if (correct !== expected) errors.push(`pythagorean leg: expected ${expected}, got ${correct}`);
    }
  }

  if (p.includes("Find the hypotenuse")) {
    const legs = [...p.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]!));
    if (legs.length >= 2) {
      const expected = String(Math.round(Math.sqrt(legs[0]! ** 2 + legs[1]! ** 2)));
      if (correct !== expected) errors.push(`pythagorean hyp: expected ${expected}, got ${correct}`);
    }
  }

  if (p.includes("\\cos\\theta =")) {
    const ratio = p.match(/\\dfrac\{(\d+)\}\{(\d+)\}/);
    if (ratio) {
      const adj = Number(ratio[1]);
      const hyp = Number(ratio[2]);
      const opp = Math.round(Math.sqrt(hyp * hyp - adj * adj));
      if (correct !== String(opp)) errors.push(`trig opposite: expected ${opp}, got ${correct}`);
    }
  }

  if (p.includes("\\sin\\theta =") && p.includes("adjacent")) {
    const ratio = p.match(/\\dfrac\{(\d+)\}\{(\d+)\}/);
    if (ratio) {
      const opp = Number(ratio[1]);
      const hyp = Number(ratio[2]);
      const adj = Math.round(Math.sqrt(hyp * hyp - opp * opp));
      if (correct !== String(adj)) errors.push(`trig adjacent: expected ${adj}, got ${correct}`);
    }
  }

  if (p.includes("thrown upward")) {
    const v0m = p.match(/(\d+)\\,\\text\{m\/s\}/);
    const tm = p.match(/after \$(\d+)\$ seconds/);
    if (v0m && tm) {
      const expected = String(
        Math.max(0, Number(v0m[1]) * Number(tm[1]) - 5 * Number(tm[1]) ** 2),
      );
      if (correct !== expected) errors.push(`projectile: expected ${expected}, got ${correct}`);
    }
  }

  if (p.startsWith("Evaluate: $") && (p.includes("\\sin") || p.includes("\\cos") || p.includes("\\tan"))) {
    const values: Record<string, string> = {
      "\\sin 30°": "1/2",
      "\\cos 60°": "1/2",
      "\\sin 60°": "\\sqrt{3}/2",
      "\\cos 30°": "\\sqrt{3}/2",
      "\\tan 45°": "1",
      "\\sin 90°": "1",
      "\\cos 0°": "1",
      "\\tan 60°": "\\sqrt{3}",
      "\\cos 45°": "\\sqrt{2}/2",
      "\\sin 45°": "\\sqrt{2}/2",
    };
    for (const [expr, val] of Object.entries(values)) {
      if (p.includes(expr) && correct !== `$${val}$`) {
        errors.push(`special angle ${expr}: expected $${val}$, got ${correct}`);
      }
    }
    if (p.includes("45°") && q.visualization === "none") {
      errors.push("45° question missing diagram");
    }
  }

  // Visualization answer leaks
  if (q.visualization === "coordinate") {
    const kind = q.vizData?.kind as string | undefined;
    if (kind === "linear" && p.startsWith("Solve for") && !q.vizData?.hideHighlight) {
      errors.push("linear solve exposes answer on graph");
    }
    if (kind === "quadratic_roots" && !q.vizData?.hideRoots) errors.push("roots marked on graph");
    if (kind === "quadratic_vertex" && !q.vizData?.hideHighlight) errors.push("vertex marked on graph");
    if (kind === "system" && !q.vizData?.hideHighlight) {
      errors.push("system graph should hide intersection (hideHighlight)");
    }
  }

  if (q.vizData?.kind === "right_triangle") {
    const hidden = (q.vizData.hiddenSides as string[] | undefined) ?? [];
    if (p.includes("missing leg") && !hidden.includes("a")) errors.push("viz shows missing leg");
    if (p.includes("Find the hypotenuse") && !hidden.includes("c")) errors.push("viz shows hypotenuse");
  }

  if (q.vizData?.kind === "similar" && !q.vizData.hideBigSide) {
    errors.push("similar triangle viz shows answer");
  }

  if (q.vizData?.kind === "trig") {
    const hidden = (q.vizData.hiddenSides as string[] | undefined) ?? [];
    if (p.includes("opposite") && !hidden.includes("a")) errors.push("trig viz shows opposite");
    if (p.includes("adjacent") && !hidden.includes("b")) errors.push("trig viz shows adjacent");
  }

  return errors;
}

const SEEDS = 100;
const EXAMS: Array<"standard" | "advanced"> = ["standard", "advanced"];
let total = 0;
const allErrors: { exam: string; seed: number; id: number; prompt: string; errs: string[] }[] = [];

for (const examId of EXAMS) {
  for (let s = 0; s < SEEDS; s += 1) {
    const questions = generateExamQuestions(examId, s * 99991 + 1, 100);
    for (const q of questions) {
      total += 1;
      const errs = verifyQuestion(q);
      if (errs.length) allErrors.push({ exam: examId, seed: s, id: q.id, prompt: q.prompt.slice(0, 100), errs });
    }
  }
}

if (allErrors.length) {
  console.error(`FAILED: ${allErrors.length} issues in ${total} questions\n`);
  for (const e of allErrors.slice(0, 40)) {
    console.error(`[${e.exam}] #${e.id} (seed ${e.seed}): ${e.errs.join("; ")}`);
    console.error(`  ${e.prompt}\n`);
  }
  process.exit(1);
}

console.log(`OK: ${total} questions validated (${EXAMS.join(", ")}, ${SEEDS} seeds each).`);
