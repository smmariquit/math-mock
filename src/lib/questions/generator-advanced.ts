import type { Topic } from "../types";
import { abstractAdvancedGenerators } from "./abstract-reasoning";
import { extendedAdvancedGenerators } from "./generator-extended";
import { buildOptions, formatFraction, pickFrom, pickInt } from "./utils";
import type { Generator, QuestionDraft } from "./bank";

function formatLinear(b: number): string {
  if (b === 0) return "";
  return b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
}

function formatSignedTerm(value: number, variable = ""): string {
  if (value === 0) return "";
  const core = variable ? `${Math.abs(value)}${variable}` : `${Math.abs(value)}`;
  return value >= 0 ? `+ ${core}` : `- ${core}`;
}

function formatQuadraticPrompt(b: number, c: number): string {
  const middle = formatSignedTerm(b, "x");
  const constant = formatSignedTerm(c);
  if (middle && constant) return `$x^2 ${middle} ${constant} = 0$`;
  if (middle) return `$x^2 ${middle} = 0$`;
  if (constant) return `$x^2 ${constant} = 0$`;
  return `$x^2 = 0$`;
}

function genWeightedMean(rng: () => number, id: number): QuestionDraft {
  const v1 = pickInt(rng, 70, 95);
  const v2 = pickInt(rng, 60, 90);
  const v3 = pickInt(rng, 50, 85);
  const w1 = pickInt(rng, 2, 4);
  const w2 = pickInt(rng, 2, 5);
  const w3 = pickInt(rng, 1, 3);
  const sumW = w1 + w2 + w3;
  const correct = ((v1 * w1 + v2 * w2 + v3 * w3) / sumW).toFixed(1);
  const { options, correctIndex } = buildOptions(rng, correct, [
    ((v1 + v2 + v3) / 3).toFixed(1),
    ((v1 * w1 + v2 * w2) / (w1 + w2)).toFixed(1),
    (Number(correct) + 2).toFixed(1),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Test scores: ${v1} (weight ${w1}), ${v2} (weight ${w2}), ${v3} (weight ${w3}). Find the weighted mean.`,
    options,
    correctIndex,
    explanation: `$\\bar{x}_w = \\dfrac{${v1}(${w1}) + ${v2}(${w2}) + ${v3}(${w3})}{${sumW}} = ${correct}$`,
    visualization: "none",
  };
}

function genMeanFromFrequency(rng: () => number, id: number): QuestionDraft {
  const x1 = pickInt(rng, 2, 6);
  const x2 = x1 + pickInt(rng, 2, 4);
  const x3 = x2 + pickInt(rng, 2, 4);
  const f1 = pickInt(rng, 2, 5);
  const f2 = pickInt(rng, 3, 6);
  const f3 = pickInt(rng, 2, 4);
  const sum = x1 * f1 + x2 * f2 + x3 * f3;
  const n = f1 + f2 + f3;
  const correct = (sum / n).toFixed(1);
  const { options, correctIndex } = buildOptions(rng, correct, [
    ((x1 + x2 + x3) / 3).toFixed(1),
    (sum / (n + 1)).toFixed(1),
    (Number(correct) + 1).toFixed(1),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Data: value $${x1}$ (freq ${f1}), $${x2}$ (freq ${f2}), $${x3}$ (freq ${f3}). Find the mean.`,
    options,
    correctIndex,
    explanation: `$\\bar{x} = \\dfrac{${x1}(${f1}) + ${x2}(${f2}) + ${x3}(${f3})}{${n}} = ${correct}$`,
    visualization: "bar_chart",
    vizData: { values: Array.from({ length: f1 }, () => x1).concat(Array.from({ length: f2 }, () => x2), Array.from({ length: f3 }, () => x3)) },
  };
}

function genStandardDeviation(rng: () => number, id: number): QuestionDraft {
  const nums = [2, 4, 4, 4, 5, 5, 7, 9];
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / nums.length;
  const sd = Math.sqrt(variance).toFixed(1);
  const { options, correctIndex } = buildOptions(rng, sd, ["1.5", "2.5", "3.0"]);
  return {
    id,
    topic: "statistics",
    prompt: `For the data set $\\{2, 4, 4, 4, 5, 5, 7, 9\\}$, find the population standard deviation (nearest tenth).`,
    options,
    correctIndex,
    explanation: `Mean $= 5$. Variance $= \\dfrac{32}{8} = 4$, so $\\sigma = 2.0$.`,
    visualization: "bar_chart",
    vizData: { values: nums },
  };
}

function genRangeAndIQR(rng: () => number, id: number): QuestionDraft {
  const nums = Array.from({ length: 7 }, () => pickInt(rng, 10, 40)).sort((a, b) => a - b);
  nums.sort((a, b) => a - b);
  const correct = String(nums[nums.length - 1]! - nums[0]!);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(nums[3]! - nums[1]!),
    String(nums[nums.length - 1]! - nums[1]!),
    String(Math.round((nums[0]! + nums[nums.length - 1]!) / 2)),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Find the range of: $${nums.join(",\\ ")}$`,
    options,
    correctIndex,
    explanation: `Range $= ${nums[nums.length - 1]} - ${nums[0]} = ${correct}$`,
    visualization: "bar_chart",
    vizData: { values: nums },
  };
}

function genCombinationHard(rng: () => number, id: number): QuestionDraft {
  const n = pickInt(rng, 10, 16);
  const correct = String((n * (n - 1) * (n - 2) * (n - 3)) / 24);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String((n * (n - 1) * (n - 2)) / 6),
    String(n * 4),
    String(Number(correct) + 10),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `How many ways can a committee of 4 be chosen from ${n} students?`,
    options,
    correctIndex,
    explanation: `$\\binom{${n}}{4} = \\dfrac{${n}(${n - 1})(${n - 2})(${n - 3})}{24} = ${correct}$`,
    visualization: "none",
  };
}

function genCompoundIndependent(rng: () => number, id: number): QuestionDraft {
  const pA = pickFrom(rng, [1, 2, 3] as const);
  const pB = pickFrom(rng, [2, 3, 4] as const);
  const totalA = pickFrom(rng, [4, 5, 6] as const);
  const totalB = pickFrom(rng, [4, 5, 6] as const);
  const num = pA * pB;
  const den = totalA * totalB;
  const correct = formatFraction(num, den);
  const { options, correctIndex } = buildOptions(rng, correct, [
    formatFraction(pA + pB, totalA + totalB),
    formatFraction(pA, totalA),
    formatFraction(pB, totalB),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Events $A$ and $B$ are independent with $P(A)=\\dfrac{${pA}}{${totalA}}$ and $P(B)=\\dfrac{${pB}}{${totalB}}$. Find $P(A \\cap B)$.`,
    options,
    correctIndex,
    explanation: `$P(A \\cap B) = P(A) \\cdot P(B) = \\dfrac{${pA}}{${totalA}} \\cdot \\dfrac{${pB}}{${totalB}} = ${correct}$`,
    visualization: "none",
  };
}

function genConditionalProbability(rng: () => number, id: number): QuestionDraft {
  const total = pickInt(rng, 20, 40);
  const red = pickInt(rng, 6, 12);
  const blue = total - red;
  const redMale = pickInt(rng, 2, Math.min(5, red));
  const correct = formatFraction(redMale, red);
  const { options, correctIndex } = buildOptions(rng, correct, [
    formatFraction(redMale, total),
    formatFraction(red, total),
    formatFraction(blue, total),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `A class of ${total} has ${red} students who play sports; ${redMale} of them are also honor students. If a sports player is chosen at random, what is P(honor student)?`,
    options,
    correctIndex,
    explanation: `$P(H|S) = \\dfrac{${redMale}}{${red}} = ${correct}$`,
    visualization: "none",
  };
}

function genProbabilityWithoutReplacement(rng: () => number, id: number): QuestionDraft {
  const red = pickInt(rng, 5, 9);
  const blue = pickInt(rng, 4, 8);
  const total = red + blue;
  const num = red * (red - 1);
  const den = total * (total - 1);
  const correct = formatFraction(num, den);
  const { options, correctIndex } = buildOptions(rng, correct, [
    formatFraction(red, total),
    formatFraction(red * blue, den),
    formatFraction(red - 1, total - 1),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `A bag has ${red} red and ${blue} blue marbles. Two marbles are drawn without replacement. Find P(both red).`,
    options,
    correctIndex,
    explanation: `$P = \\dfrac{${red}}{${total}} \\cdot \\dfrac{${red - 1}}{${total - 1}} = ${correct}$`,
    visualization: "none",
  };
}

function genFunctionComposition(rng: () => number, id: number): QuestionDraft {
  const m = pickInt(rng, 2, 4);
  const b = pickInt(rng, 1, 5);
  const x = pickInt(rng, 2, 6);
  const inner = x * x;
  const correct = String(m * inner + b);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(m * x + b),
    String(inner + b),
    String(m * x * x),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `If $f(x)=${m}x ${formatLinear(b)}$ and $g(x)=x^2$, find $f(g(${x}))$.`,
    options,
    correctIndex,
    explanation: `$g(${x})=${inner}$, so $f(g(${x}))=${m}(${inner}) ${formatLinear(b)} = ${correct}$`,
    visualization: "none",
  };
}

function genFunctionInverse(rng: () => number, id: number): QuestionDraft {
  const m = pickFrom(rng, [2, 3, 4, 5] as const);
  const b = pickInt(rng, 2, 9);
  const y = m * pickInt(rng, 3, 8) + b;
  const correct = String((y - b) / m);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(y / m),
    String(y - b),
    String((y + b) / m),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `If $f(x)=${m}x ${formatLinear(b)}$, find $x$ such that $f(x)=${y}$.`,
    options,
    correctIndex,
    explanation: `$${m}x = ${y - b}$, so $x = ${correct}$`,
    visualization: "none",
  };
}

function genArithmeticSeriesSum(rng: () => number, id: number): QuestionDraft {
  const a1 = pickInt(rng, 3, 8);
  const d = pickInt(rng, 3, 7);
  const n = pickInt(rng, 8, 12);
  const correct = String((n / 2) * (2 * a1 + (n - 1) * d));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a1 + (n - 1) * d),
    String(n * a1),
    String(Number(correct) + d),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `Find the sum of the first ${n} terms of an arithmetic sequence with $a_1=${a1}$ and $d=${d}$.`,
    options,
    correctIndex,
    explanation: `$S_n = \\dfrac{n}{2}(2a_1 + (n-1)d) = \\dfrac{${n}}{2}(2(${a1}) + ${n - 1}(${d})) = ${correct}$`,
    visualization: "none",
  };
}

function genGeometricSeriesSum(rng: () => number, id: number): QuestionDraft {
  const a1 = pickInt(rng, 2, 4);
  const r = pickFrom(rng, [2, 3] as const);
  const n = pickInt(rng, 4, 6);
  const correct = String(a1 * (Math.pow(r, n) - 1) / (r - 1));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a1 * Math.pow(r, n - 1)),
    String(a1 * n * r),
    String(Number(correct) + a1),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `Find the sum $S_${n}$ of the geometric series with first term $${a1}$ and ratio $${r}$: $${a1} + ${a1 * r} + ${a1 * r * r} + \\cdots$`,
    options,
    correctIndex,
    explanation: `$S_n = a_1\\dfrac{r^n - 1}{r - 1} = ${a1} \\cdot \\dfrac{${Math.pow(r, n)} - 1}{${r - 1}} = ${correct}$`,
    visualization: "none",
  };
}

function genExponentialGrowth(rng: () => number, id: number): QuestionDraft {
  const p0 = pickInt(rng, 100, 500);
  const rate = pickFrom(rng, [2, 3] as const);
  const t = pickInt(rng, 2, 4);
  const correct = String(p0 * Math.pow(rate, t));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(p0 + rate * t),
    String(p0 * rate * t),
    String(p0 * Math.pow(rate, t - 1)),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `A population doubles every period. Starting at ${p0}, how many after ${t} periods if it multiplies by ${rate} each period?`,
    options,
    correctIndex,
    explanation: `$P = ${p0} \\cdot ${rate}^{${t}} = ${correct}$`,
    visualization: "none",
  };
}

function genQuadraticDiscriminant(rng: () => number, id: number): QuestionDraft {
  const roots = pickFrom(rng, ["two", "one", "none"] as const);
  let b: number;
  let c: number;
  let vizRoots: number[] = [];
  if (roots === "two") {
    b = -5;
    c = 6;
    vizRoots = [2, 3];
  } else if (roots === "one") {
    b = -6;
    c = 9;
    vizRoots = [3, 3];
  } else {
    b = 2;
    c = 5;
    vizRoots = [];
  }
  const disc = b * b - 4 * c;
  const correct =
    disc > 0 ? "Two distinct real roots" : disc === 0 ? "One repeated real root" : "No real roots";
  const wrong = ["Two distinct real roots", "One repeated real root", "No real roots"].filter(
    (o) => o !== correct,
  );
  const { options, correctIndex } = buildOptions(rng, correct, wrong);
  return {
    id,
    topic: "algebra",
    prompt: `Describe the roots of ${formatQuadraticPrompt(b, c)}`,
    options,
    correctIndex,
    explanation: `Discriminant $b^2 - 4ac = ${disc}$ → ${correct.toLowerCase()}.`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: vizRoots, hideRoots: true },
  };
}

function genQuadraticFormula(rng: () => number, id: number): QuestionDraft {
  const r1 = pickInt(rng, 2, 6);
  const r2 = pickInt(rng, -4, 4);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const correct = r2 === r1 ? String(r1) : `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`;
  const wrong = [String(r1 + r2), String(Math.abs(c)), `${r1}, ${r1 + r2}`];
  const { options, correctIndex } = buildOptions(rng, correct, wrong);
  return {
    id,
    topic: "algebra",
    prompt: `Use the quadratic formula on ${formatQuadraticPrompt(b, c)}. Give the roots.`,
    options,
    correctIndex,
    explanation: `Roots: $x = ${correct}$`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
  };
}

function genQuadraticInequality(rng: () => number, id: number): QuestionDraft {
  const r1 = pickInt(rng, 1, 4);
  const r2 = r1 + pickInt(rng, 2, 5);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const correct = `$x < ${r1} \\text{ or } x > ${r2}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$${r1} < x < ${r2}$`,
    `$x > ${r1}$`,
    `$x < ${r2}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve: $x^2 ${formatSignedTerm(b, "x")} ${formatSignedTerm(c)} > 0$`,
    options,
    correctIndex,
    explanation: `Parabola opens up; positive outside the roots $${r1}$ and $${r2}$.`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
  };
}

function genExponentProductRule(rng: () => number, id: number): QuestionDraft {
  const base = pickFrom(rng, [2, 3, 5] as const);
  const m = pickInt(rng, 3, 6);
  const n = pickInt(rng, 2, 5);
  const correct = `$${base}^{${m + n}}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$${base}^{${m * n}}$`,
    `$${base + m + n}$`,
    `$${base}^{${m - n}}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Simplify: $${base}^{${m}} \\cdot ${base}^{${n}}$`,
    options,
    correctIndex,
    explanation: `$a^m \\cdot a^n = a^{m+n} = ${correct}$`,
    visualization: "none",
  };
}

function genFactorDifferenceSquares(rng: () => number, id: number): QuestionDraft {
  const a = pickInt(rng, 2, 7);
  const correct = `$(${a}x - 3)(${a}x + 3)$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${a}x - 3)^2$`,
    `$(${a}x + 9)(${a}x - 1)$`,
    `$(${a + 1}x - 3)(${a}x + 3)$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Factor: $${a * a}x^2 - 9$`,
    options,
    correctIndex,
    explanation: `Difference of squares: $(${a}x)^2 - 3^2 = ${correct}$`,
    visualization: "none",
  };
}

function genSystemHard(rng: () => number, id: number): QuestionDraft {
  const x = pickInt(rng, 2, 9);
  const y = pickInt(rng, 3, 9);
  const a1 = pickInt(rng, 2, 6);
  const b1 = pickInt(rng, 2, 6);
  const a2 = pickInt(rng, 3, 7);
  const b2 = pickInt(rng, 3, 7);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  const correct = `$(${x}, ${y})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${x + 1}, ${y})$`,
    `$(${x}, ${y + 2})$`,
    `$(${y}, ${x})$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve:\\[\\begin{cases}${a1}x + ${b1}y = ${c1} \\\\ ${a2}x + ${b2}y = ${c2}\\end{cases}\\]`,
    options,
    correctIndex,
    explanation: `Elimination gives $x=${x}$, $y=${y}$.`,
    visualization: "coordinate",
    vizData: { kind: "system", system: [a1, b1, c1, a2, b2, c2], solution: [x, y], hideHighlight: true },
  };
}

function genDistanceFormula(rng: () => number, id: number): QuestionDraft {
  const x1 = pickInt(rng, -3, 2);
  const y1 = pickInt(rng, -2, 3);
  const x2 = x1 + pickInt(rng, 3, 6);
  const y2 = y1 + pickInt(rng, 3, 6);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const correct = String(Math.sqrt(dx * dx + dy * dy));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(dx + dy),
    String(Math.abs(dx) + Math.abs(dy)),
    String(Math.sqrt(dx * dx + dy)),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the distance between $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
    options,
    correctIndex,
    explanation: `$d = \\sqrt{(${dx})^2 + (${dy})^2} = ${correct}$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m: dy / dx, b: y1 - (dy / dx) * x1, hideHighlight: true },
  };
}

function genMidpoint(rng: () => number, id: number): QuestionDraft {
  const x1 = pickInt(rng, 0, 6);
  const y1 = pickInt(rng, 0, 6);
  const x2 = x1 + pickInt(rng, 2, 8) * 2;
  const y2 = y1 + pickInt(rng, 2, 8) * 2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const correct = `$(${mx}, ${my})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${x1 + x2}, ${y1 + y2})$`,
    `$(${mx + 1}, ${my})$`,
    `$(${x1}, ${my})$`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the midpoint of $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
    options,
    correctIndex,
    explanation: `$M = \\left(\\dfrac{${x1}+${x2}}{2}, \\dfrac{${y1}+${y2}}{2}\\right) = ${correct}$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m: 0, b: my, hideHighlight: true },
  };
}

function genSimilarWord(rng: () => number, id: number): QuestionDraft {
  const k = pickInt(rng, 3, 5);
  const areaSmall = pickInt(rng, 8, 20);
  const areaLarge = areaSmall * k * k;
  const correct = String(areaLarge);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(areaSmall * k),
    String(areaSmall + k * k),
    String(areaSmall * k * k + 1),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Two similar triangles have linear scale factor $${k}:1$. If the smaller area is $${areaSmall}$, find the larger area.`,
    options,
    correctIndex,
    explanation: `Areas scale by $k^2$: $${areaSmall} \\times ${k}^2 = ${correct}$`,
    visualization: "triangle",
    vizData: { kind: "similar", scale: k, side: 4, hideBigSide: true },
  };
}

function genTrigElevation(rng: () => number, id: number): QuestionDraft {
  const angle = pickFrom(rng, [30, 45, 60] as const);
  const dist = pickInt(rng, 10, 30);
  let height: number;
  if (angle === 30) height = Math.round(dist / Math.sqrt(3));
  else if (angle === 45) height = dist;
  else height = Math.round(dist * Math.sqrt(3));
  const correct = String(height);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(dist),
    String(height + 5),
    String(Math.round(height / 2)),
  ]);
  return {
    id,
    topic: "trigonometry",
    prompt: `From ${dist} m away, the angle of elevation to a tower top is $${angle}°$. Find the tower height. (Use exact values.)`,
    options,
    correctIndex,
    explanation: `$h = ${dist} \\tan ${angle}° = ${correct}$ m`,
    visualization: "triangle",
    vizData: { kind: "trig", a: height, b: dist, c: Math.round(Math.sqrt(height * height + dist * dist)), hiddenSides: ["a"] },
  };
}

function genTrigIdentityAdvanced(rng: () => number, id: number): QuestionDraft {
  const items = [
    {
      prompt: `Simplify: $\\dfrac{1}{\\cos\\theta} - \\cos\\theta$`,
      correct: "$\\sin\\theta \\tan\\theta$",
      distractors: ["$\\tan\\theta$", "$\\sec\\theta$", "$1$"],
      explanation: `$\\sec\\theta - \\cos\\theta = \\dfrac{1 - \\cos^2\\theta}{\\cos\\theta} = \\dfrac{\\sin^2\\theta}{\\cos\\theta}$`,
    },
    {
      prompt: `Simplify: $\\tan\\theta \\cdot \\cos\\theta$`,
      correct: "$\\sin\\theta$",
      distractors: ["$\\cos\\theta$", "$\\tan\\theta$", "$1$"],
      explanation: `$\\tan\\theta \\cos\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} \\cdot \\cos\\theta = \\sin\\theta$`,
    },
    {
      prompt: `Simplify: $1 + \\tan^2\\theta$`,
      correct: "$\\sec^2\\theta$",
      distractors: ["$\\tan^2\\theta$", "$1$", "$\\cos^2\\theta$"],
      explanation: `Pythagorean identity: $1 + \\tan^2\\theta = \\sec^2\\theta$`,
    },
  ];
  const item = pickFrom(rng, items);
  const { options, correctIndex } = buildOptions(rng, item.correct, item.distractors);
  return {
    id,
    topic: "trigonometry",
    prompt: item.prompt,
    options,
    correctIndex,
    explanation: item.explanation,
    visualization: "none",
  };
}

function genParabolaMax(rng: () => number, id: number): QuestionDraft {
  const h = pickInt(rng, 1, 5);
  const k = pickInt(rng, 8, 20);
  const correct = String(k);
  const signH = h >= 0 ? "-" : "+";
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(h),
    String(k + 3),
    String(k - 4),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `The parabola $y = -(x ${signH} ${Math.abs(h)})^2 + ${k}$ opens downward. What is its maximum value?`,
    options,
    correctIndex,
    explanation: `Maximum $y$-value is the vertex's $y$-coordinate: $${k}$.`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_vertex", vertex: [h, k], hideHighlight: true },
  };
}

function genPermutationFixed(rng: () => number, id: number): QuestionDraft {
  const n = pickInt(rng, 6, 10);
  const r = 3;
  let p = 1;
  for (let i = 0; i < r; i += 1) p *= n - i;
  const correct = String(p);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Math.round(p / 2)),
    String(n * r),
    String((n * (n - 1) * (n - 2)) / 6),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `How many ordered 3-digit codes can be made from ${n} different digits without repetition?`,
    options,
    correctIndex,
    explanation: `$P(${n},3) = ${n} \\times ${n - 1} \\times ${n - 2} = ${correct}$`,
    visualization: "none",
  };
}

export const advancedGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "statistics", fn: genWeightedMean },
  { topic: "statistics", fn: genMeanFromFrequency },
  { topic: "statistics", fn: genStandardDeviation },
  { topic: "statistics", fn: genRangeAndIQR },
  { topic: "statistics", fn: genPermutationFixed },
  { topic: "statistics", fn: genCombinationHard },
  { topic: "statistics", fn: genCompoundIndependent },
  { topic: "statistics", fn: genConditionalProbability },
  { topic: "statistics", fn: genProbabilityWithoutReplacement },
  { topic: "functions", fn: genFunctionComposition },
  { topic: "functions", fn: genFunctionInverse },
  { topic: "functions", fn: genArithmeticSeriesSum },
  { topic: "functions", fn: genGeometricSeriesSum },
  { topic: "functions", fn: genExponentialGrowth },
  { topic: "functions", fn: genParabolaMax },
  { topic: "algebra", fn: genQuadraticDiscriminant },
  { topic: "algebra", fn: genQuadraticFormula },
  { topic: "algebra", fn: genQuadraticInequality },
  { topic: "algebra", fn: genExponentProductRule },
  { topic: "algebra", fn: genFactorDifferenceSquares },
  { topic: "algebra", fn: genSystemHard },
  { topic: "geometry", fn: genDistanceFormula },
  { topic: "geometry", fn: genMidpoint },
  { topic: "geometry", fn: genSimilarWord },
  { topic: "trigonometry", fn: genTrigElevation },
  { topic: "trigonometry", fn: genTrigIdentityAdvanced },
  { topic: "algebra", fn: genQuadraticInequality },
  { topic: "statistics", fn: genProbabilityWithoutReplacement },
  { topic: "functions", fn: genGeometricSeriesSum },
  ...extendedAdvancedGenerators,
  ...abstractAdvancedGenerators,
];
