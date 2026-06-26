import type { Topic } from "../types";
import {
  buildOptions,
  formatFraction,
  pickFrom,
  pickInt,
} from "./utils";
import type { Generator, QuestionDraft } from "./bank";

export const standardGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "number_sense", fn: genFractionAdd },
  { topic: "number_sense", fn: genPercentOf },
  { topic: "number_sense", fn: genRatioProblem },
  { topic: "number_sense", fn: genDecimalMultiply },
  { topic: "number_sense", fn: genIntegerOps },
  { topic: "algebra", fn: genLinearEquation },
  { topic: "algebra", fn: genQuadraticRoots },
  { topic: "algebra", fn: genFactorTrinomial },
  { topic: "algebra", fn: genSystemOfEquations },
  { topic: "algebra", fn: genExponentSimplify },
  { topic: "algebra", fn: genInequality },
  { topic: "geometry", fn: genPythagorean },
  { topic: "geometry", fn: genTriangleArea },
  { topic: "geometry", fn: genCircleArea },
  { topic: "geometry", fn: genRectanglePerimeter },
  { topic: "geometry", fn: genSimilarTriangles },
  { topic: "trigonometry", fn: genSohCahToa },
  { topic: "trigonometry", fn: genSpecialAngles },
  { topic: "trigonometry", fn: genTrigIdentity },
  { topic: "statistics", fn: genMean },
  { topic: "statistics", fn: genMedian },
  { topic: "statistics", fn: genProbability },
  { topic: "statistics", fn: genCombination },
  { topic: "functions", fn: genArithmeticSequence },
  { topic: "functions", fn: genGeometricSequence },
  { topic: "functions", fn: genFunctionEvaluate },
  { topic: "functions", fn: genParabolaVertex },
  { topic: "geometry", fn: genProjectileHeight },
];

function genFractionAdd(rng: () => number, id: number): QuestionDraft {
  const a = pickInt(rng, 1, 9);
  const b = pickInt(rng, 2, 10);
  const c = pickInt(rng, 1, 9);
  const d = pickInt(rng, 2, 10);
  const num = a * d + c * b;
  const den = b * d;
  const correct = formatFraction(num, den);
  const { options, correctIndex } = buildOptions(rng, correct, [
    formatFraction(num + 1, den),
    formatFraction(num, den + b),
    formatFraction(a + c, b + d),
  ]);
  return {
    id,
    topic: "number_sense",
    prompt: `Evaluate: $\\dfrac{${a}}{${b}} + \\dfrac{${c}}{${d}}$`,
    options,
    correctIndex,
    explanation: `Common denominator ${b * d}: $\\dfrac{${a * d}}{${b * d}} + \\dfrac{${c * b}}{${b * d}} = \\dfrac{${num}}{${den}}$`,
    visualization: "none",
  };
}

function genPercentOf(rng: () => number, id: number): QuestionDraft {
  const pct = pickFrom(rng, [5, 10, 12, 15, 20, 25, 30, 40, 50]);
  const base = pickInt(rng, 20, 400);
  const correct = String((pct / 100) * base);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String((pct / 100) * base + 5),
    String(Math.round(base / pct)),
    String(pct + base),
  ]);
  return {
    id,
    topic: "number_sense",
    prompt: `What is ${pct}\\% of ${base}?`,
    options,
    correctIndex,
    explanation: `${pct}\\% \\times ${base} = \\dfrac{${pct}}{100} \\times ${base} = ${correct}`,
    visualization: "none",
  };
}

function genRatioProblem(rng: () => number, id: number): QuestionDraft {
  let a = pickInt(rng, 2, 7);
  let b = pickInt(rng, 2, 7);
  if (a === b) b = a + 1 <= 7 ? a + 1 : a - 1;
  const total = pickInt(rng, 3, 12) * (a + b);
  const correct = String(Math.round((total * a) / (a + b)));
  const girls = String(Math.round((total * b) / (a + b)));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Math.round(total / (a + b))),
    girls,
    String(Number(correct) + 1),
  ]);
  return {
    id,
    topic: "number_sense",
    prompt: `A class has boys and girls in ratio $${a}:${b}$. If there are ${total} students, how many are boys?`,
    options,
    correctIndex,
    explanation: `Boys $= \\dfrac{${a}}{${a + b}} \\times ${total} = ${correct}$`,
    visualization: "bar_chart",
    vizData: { segments: [a, b], total },
  };
}

function genDecimalMultiply(rng: () => number, id: number): QuestionDraft {
  const x = pickInt(rng, 2, 9);
  const y = pickInt(rng, 1, 9);
  const dec = x / 10;
  const correct = (dec * y).toFixed(1);
  const { options, correctIndex } = buildOptions(rng, correct, [
    (dec + y).toFixed(1),
    (dec * y + 0.2).toFixed(1),
    (x * y).toFixed(1),
  ]);
  return {
    id,
    topic: "number_sense",
    prompt: `Compute: $${dec} \\times ${y}$`,
    options,
    correctIndex,
    explanation: `$${dec} \\times ${y} = ${correct}$`,
    visualization: "none",
  };
}

function genIntegerOps(rng: () => number, id: number): QuestionDraft {
  const a = pickInt(rng, 10, 99);
  const b = pickInt(rng, 2, 9);
  const c = pickInt(rng, 2, 9);
  const correct = String(a - b * c);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a - b + c),
    String((a - b) * c),
    String(a + b * c),
  ]);
  return {
    id,
    topic: "number_sense",
    prompt: `Evaluate: $${a} - ${b} \\times ${c}$ (follow order of operations)`,
    options,
    correctIndex,
    explanation: `Multiply first: $${b} \\times ${c} = ${b * c}$, then $${a} - ${b * c} = ${correct}$`,
    visualization: "none",
  };
}

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
  const middle = formatSignedTerm(b, "x").replace(/^\+ /, "");
  const constant = formatSignedTerm(c);
  if (middle && constant) return `$x^2 ${middle} ${constant} = 0$`;
  if (middle) return `$x^2 ${middle} = 0$`;
  if (constant) return `$x^2 ${constant} = 0$`;
  return `$x^2 = 0$`;
}

function genLinearEquation(rng: () => number, id: number): QuestionDraft {
  const m = pickInt(rng, 2, 9);
  const x = pickInt(rng, 1, 12);
  let b = pickInt(rng, -9, 9);
  if (b === 0) b = pickInt(rng, 1, 9) * (rng() > 0.5 ? 1 : -1);
  const c = m * x + b;
  const correct = String(x);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(x + 1),
    String(x - 1),
    String(c),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve for $x$: $${m}x ${formatLinear(b)} = ${c}$`,
    options,
    correctIndex,
    explanation: `$${m}x = ${c - b}$, so $x = \\dfrac{${c - b}}{${m}} = ${x}$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m, b, highlightX: x, hideHighlight: true },
  };
}

function genQuadraticRoots(rng: () => number, id: number): QuestionDraft {
  const r1 = pickInt(rng, 1, 8);
  let r2 = pickInt(rng, -8, 8);
  if (r2 === 0) r2 = pickInt(rng, 1, 8) * (rng() > 0.5 ? 1 : -1);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const correct = r2 === r1 ? String(r1) : `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`;
  const wrong = [
    String(r1 + r2),
    String(Math.abs(r1 * r2)),
    `${r1}, ${r1 + r2}`,
  ];
  const { options, correctIndex } = buildOptions(rng, correct, wrong);
  return {
    id,
    topic: "algebra",
    prompt: `Find the roots of ${formatQuadraticPrompt(b, c)}`,
    options,
    correctIndex,
    explanation: `Factor: $(x - ${r1})(x - ${r2}) = 0$, roots are $x = ${r1}$ and $x = ${r2}$`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
  };
}

function genFactorTrinomial(rng: () => number, id: number): QuestionDraft {
  const p = pickInt(rng, 1, 7);
  const q = pickInt(rng, 1, 7);
  const correct = `$(x + ${p})(x + ${q})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(x + ${p + 1})(x + ${q})$`,
    `$(x - ${p})(x - ${q})$`,
    `$(x + ${p * q})(x + 1)$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Factor completely: $x^2 + ${p + q}x + ${p * q}$`,
    options,
    correctIndex,
    explanation: `Find two numbers that multiply to ${p * q} and add to ${p + q}: ${p} and ${q}`,
    visualization: "none",
  };
}

function genSystemOfEquations(rng: () => number, id: number): QuestionDraft {
  const x = pickInt(rng, 1, 9);
  const y = pickInt(rng, 1, 9);
  const a1 = pickInt(rng, 1, 5);
  const b1 = pickInt(rng, 1, 5);
  const c1 = a1 * x + b1 * y;
  const a2 = pickInt(rng, 1, 5);
  const b2 = pickInt(rng, 1, 5);
  const c2 = a2 * x + b2 * y;
  const correct = `$(${x}, ${y})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${x + 1}, ${y})$`,
    `$(${x}, ${y + 1})$`,
    `$(${y}, ${x})$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve the system:\\[\\begin{cases}${a1}x + ${b1}y = ${c1} \\\\ ${a2}x + ${b2}y = ${c2}\\end{cases}\\]`,
    options,
    correctIndex,
    explanation: `Substitution or elimination gives $x = ${x}$, $y = ${y}$`,
    visualization: "coordinate",
    vizData: { kind: "system", system: [a1, b1, c1, a2, b2, c2], solution: [x, y], hideHighlight: true },
  };
}

function genExponentSimplify(rng: () => number, id: number): QuestionDraft {
  const base = pickFrom(rng, [2, 3, 5]);
  const exp = pickInt(rng, 2, 5);
  const correct = String(Math.pow(base, exp));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(base * exp),
    String(Math.pow(base, exp - 1)),
    String(Math.pow(base, exp + 1)),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Simplify: $${base}^{${exp}}$`,
    options,
    correctIndex,
    explanation: `$${base}^{${exp}} = ${correct}$`,
    visualization: "none",
  };
}

function genInequality(rng: () => number, id: number): QuestionDraft {
  const k = pickInt(rng, 2, 8);
  const c = pickInt(rng, 10, 40);
  const boundary = c / k;
  const boundaryStr = Number.isInteger(boundary) ? String(boundary) : boundary.toFixed(1);
  const correct = `$x \\leq ${boundaryStr}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$x > ${boundaryStr}$`,
    `$x \\geq ${Number(boundaryStr) + 1}$`,
    `$x \\leq ${Number(boundaryStr) - 1}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve: $${k}x \\leq ${c}$`,
    options,
    correctIndex,
    explanation: `Divide both sides by ${k}: $x \\leq ${c}/${k}$`,
    visualization: "none",
  };
}

function genPythagorean(rng: () => number, id: number): QuestionDraft {
  const triples: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [6, 8, 10],
  ];
  const [a, b, c] = pickFrom(rng, triples);
  const askLeg = rng() > 0.5;
  const correct = askLeg ? String(a) : String(c);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a + 1),
    String(b + 2),
    String(a + b),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: askLeg
      ? `A right triangle has a leg $${b}$ and hypotenuse $${c}$. Find the missing leg.`
      : `A right triangle has legs $${a}$ and $${b}$. Find the hypotenuse.`,
    options,
    correctIndex,
    explanation: `$c^2 = a^2 + b^2 = ${a ** 2} + ${b ** 2} = ${c ** 2}$, so missing side $= ${correct}$`,
    visualization: "triangle",
    vizData: { kind: "right_triangle", a, b, c, hiddenSides: askLeg ? ["a"] : ["c"] },
  };
}

function genTriangleArea(rng: () => number, id: number): QuestionDraft {
  const base = pickInt(rng, 6, 20);
  const height = pickInt(rng, 4, 16);
  const correct = String((base * height) / 2);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(base * height),
    String(base + height),
    String(Math.round((base * height) / 3)),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the area of a triangle with base $${base}$ and height $${height}$.`,
    options,
    correctIndex,
    explanation: `$A = \\dfrac{1}{2}bh = \\dfrac{1}{2}(${base})(${height}) = ${correct}$`,
    visualization: "triangle",
    vizData: { kind: "base_height", base, height },
  };
}

function genCircleArea(rng: () => number, id: number): QuestionDraft {
  const r = pickInt(rng, 2, 12);
  const correctStr = `${r * r}\\pi`;
  const { options, correctIndex } = buildOptions(rng, correctStr, [
    `${2 * r}\\pi`,
    `${r}\\pi`,
    `${(r + 1) ** 2}\\pi`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the area of a circle with radius $${r}$.`,
    options,
    correctIndex,
    explanation: `$A = \\pi r^2 = \\pi(${r})^2 = ${r * r}\\pi$`,
    visualization: "circle",
    vizData: { kind: "circle", r },
  };
}

function genRectanglePerimeter(rng: () => number, id: number): QuestionDraft {
  const l = pickInt(rng, 5, 20);
  const w = pickInt(rng, 3, 15);
  const correct = String(2 * (l + w));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(l * w),
    String(l + w),
    String(2 * l * w),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `A rectangle has length $${l}$ cm and width $${w}$ cm. What is its perimeter?`,
    options,
    correctIndex,
    explanation: `$P = 2(l + w) = 2(${l} + ${w}) = ${correct}$ cm`,
    visualization: "none",
  };
}

function genSimilarTriangles(rng: () => number, id: number): QuestionDraft {
  const k = pickInt(rng, 2, 4);
  const side = pickInt(rng, 3, 9);
  const correct = String(side * k);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(side + k),
    String(side / k),
    String(side * k + 1),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Two similar triangles have a scale factor of $${k}:1$. If a side in the smaller triangle is $${side}$, find the corresponding side in the larger triangle.`,
    options,
    correctIndex,
    explanation: `Corresponding sides scale by ${k}: $${side} \\times ${k} = ${correct}$`,
    visualization: "triangle",
    vizData: { kind: "similar", scale: k, side, hideBigSide: true },
  };
}

function genSohCahToa(rng: () => number, id: number): QuestionDraft {
  const triples: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [6, 8, 10],
  ];
  const [a, b, c] = pickFrom(rng, triples);
  const askOpp = rng() > 0.5;
  const correct = askOpp ? String(a) : String(b);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(c),
    String(a + b),
    String(Math.abs(a - b)),
  ]);
  return {
    id,
    topic: "trigonometry",
    prompt: askOpp
      ? `In a right triangle, $\\cos\\theta = \\dfrac{${b}}{${c}}$. Find the side opposite $\\theta$.`
      : `In a right triangle, $\\sin\\theta = \\dfrac{${a}}{${c}}$. Find the side adjacent to $\\theta$.`,
    options,
    correctIndex,
    explanation: `Use SOH-CAH-TOA. Missing side $= ${correct}$`,
    visualization: "triangle",
    vizData: { kind: "trig", a, b, c, hiddenSides: askOpp ? ["a"] : ["b"] },
  };
}

function genSpecialAngles(rng: () => number, id: number): QuestionDraft {
  const pairs: [string, string][] = [
    ["\\sin 30°", "1/2"],
    ["\\cos 60°", "1/2"],
    ["\\sin 60°", "\\sqrt{3}/2"],
    ["\\cos 30°", "\\sqrt{3}/2"],
    ["\\tan 45°", "1"],
    ["\\sin 90°", "1"],
    ["\\cos 0°", "1"],
    ["\\tan 60°", "\\sqrt{3}"],
    ["\\cos 45°", "\\sqrt{2}/2"],
    ["\\sin 45°", "\\sqrt{2}/2"],
  ];
  const [expr, val] = pickFrom(rng, pairs);
  const correct = `$${val}$`;
  const { options, correctIndex } = buildOptions(rng, correct, ["$0$", "$\\sqrt{2}$", "$\\sqrt{3}$"]);
  const noDiagram = /\\sin 90°|\\cos 0°/.test(expr);
  return {
    id,
    topic: "trigonometry",
    prompt: `Evaluate: $${expr}$`,
    options,
    correctIndex,
    explanation: `Special angle value: $${expr} = ${val}$`,
    visualization: noDiagram ? "none" : "triangle",
    vizData: noDiagram ? undefined : { kind: "special_angle", special: expr },
  };
}

function genTrigIdentity(rng: () => number, id: number): QuestionDraft {
  const identities = [
    {
      prompt: `Simplify: $\\sin^2\\theta + \\cos^2\\theta$`,
      correct: "$1$",
      distractors: ["$0$", "$2$", "$\\sin\\theta$"],
      explanation: `Pythagorean identity: $\\sin^2\\theta + \\cos^2\\theta = 1$`,
    },
    {
      prompt: `Simplify: $1 - \\sin^2\\theta$`,
      correct: "$\\cos^2\\theta$",
      distractors: ["$\\sin^2\\theta$", "$1$", "$\\tan^2\\theta$"],
      explanation: `$1 - \\sin^2\\theta = \\cos^2\\theta$`,
    },
    {
      prompt: `Simplify: $1 - \\cos^2\\theta$`,
      correct: "$\\sin^2\\theta$",
      distractors: ["$\\cos^2\\theta$", "$1$", "$\\sec^2\\theta$"],
      explanation: `$1 - \\cos^2\\theta = \\sin^2\\theta$`,
    },
    {
      prompt: `Simplify: $\\dfrac{\\sin\\theta}{\\cos\\theta}$`,
      correct: "$\\tan\\theta$",
      distractors: ["$\\cot\\theta$", "$1$", "$\\sin\\theta$"],
      explanation: `$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$`,
    },
  ];
  const item = pickFrom(rng, identities);
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

function genMean(rng: () => number, id: number): QuestionDraft {
  const nums = Array.from({ length: 5 }, () => pickInt(rng, 10, 99));
  const sum = nums.reduce((a, b) => a + b, 0);
  const correct = (sum / nums.length).toFixed(1);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Math.round(sum / (nums.length + 1))),
    String(nums[0]),
    (Number(correct) + 2).toFixed(1),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Find the mean of: $${nums.join(",\\ ")}$`,
    options,
    correctIndex,
    explanation: `Mean $= \\dfrac{${sum}}{${nums.length}} = ${correct}$`,
    visualization: "bar_chart",
    vizData: { values: nums },
  };
}

function genMedian(rng: () => number, id: number): QuestionDraft {
  const nums = Array.from({ length: 5 }, () => pickInt(rng, 1, 30)).sort((a, b) => a - b);
  const correct = String(nums[2]);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(nums[0]),
    String(nums[4]),
    String(Math.round((nums[1]! + nums[3]!) / 2)),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `Find the median of: $${nums.join(",\\ ")}$`,
    options,
    correctIndex,
    explanation: `Ordered data — middle value is ${correct}`,
    visualization: "bar_chart",
    vizData: { values: nums },
  };
}

function genProbability(rng: () => number, id: number): QuestionDraft {
  const red = pickInt(rng, 2, 6);
  const blue = pickInt(rng, 3, 8);
  const total = red + blue;
  const correct = formatFraction(red, total);
  const { options, correctIndex } = buildOptions(rng, correct, [
    formatFraction(blue, total),
    formatFraction(1, total),
    formatFraction(red, blue),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `A bag has ${red} red and ${blue} blue marbles. What is P(red)?`,
    options,
    correctIndex,
    explanation: `$P(\\text{red}) = \\dfrac{${red}}{${total}}$`,
    visualization: "none",
  };
}

function genCombination(rng: () => number, id: number): QuestionDraft {
  const n = pickInt(rng, 5, 14);
  const r = pickFrom(rng, [2, 3] as const);
  let correct: string;
  if (r === 2) {
    correct = String((n * (n - 1)) / 2);
  } else {
    correct = String((n * (n - 1) * (n - 2)) / 6);
  }
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(n * r),
    String(n + r),
    String(n * (n - 1)),
  ]);
  return {
    id,
    topic: "statistics",
    prompt: `How many ways can you choose ${r} students from ${n}?`,
    options,
    correctIndex,
    explanation:
      r === 2
        ? `$\\binom{${n}}{2} = \\dfrac{${n} \\cdot ${n - 1}}{2} = ${correct}$`
        : `$\\binom{${n}}{3} = \\dfrac{${n} \\cdot ${n - 1} \\cdot ${n - 2}}{6} = ${correct}$`,
    visualization: "none",
  };
}

function genArithmeticSequence(rng: () => number, id: number): QuestionDraft {
  const a1 = pickInt(rng, 2, 10);
  const d = pickInt(rng, 2, 7);
  const n = pickInt(rng, 5, 10);
  const correct = String(a1 + (n - 1) * d);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a1 + n * d),
    String(a1 * n),
    String(d * n),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `In an arithmetic sequence, $a_1 = ${a1}$ and $d = ${d}$. Find $a_{${n}}$.`,
    options,
    correctIndex,
    explanation: `$a_n = a_1 + (n-1)d = ${a1} + ${n - 1}(${d}) = ${correct}$`,
    visualization: "none",
  };
}

function genGeometricSequence(rng: () => number, id: number): QuestionDraft {
  const a1 = pickInt(rng, 2, 5);
  const r = pickInt(rng, 2, 3);
  const n = pickInt(rng, 3, 5);
  const correct = String(a1 * Math.pow(r, n - 1));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a1 + (n - 1) * r),
    String(a1 * r * n),
    String(Math.pow(r, n)),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `A geometric sequence has $a_1 = ${a1}$ and common ratio $r = ${r}$. Find $a_{${n}}$.`,
    options,
    correctIndex,
    explanation: `$a_n = a_1 \\cdot r^{n-1} = ${a1} \\cdot ${r}^{${n - 1}} = ${correct}$`,
    visualization: "none",
  };
}

function genFunctionEvaluate(rng: () => number, id: number): QuestionDraft {
  const m = pickInt(rng, 1, 5);
  let b = pickInt(rng, -5, 5);
  if (b === 0) b = pickInt(rng, 1, 5) * (rng() > 0.5 ? 1 : -1);
  const x = pickInt(rng, 1, 8);
  const correct = String(m * x + b);
  const bPart = formatLinear(b);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(m * x - b),
    String(m + x + b),
    String(m * (x + b)),
  ]);
  return {
    id,
    topic: "functions",
    prompt: bPart
      ? `If $f(x) = ${m}x ${bPart}$, find $f(${x})$.`
      : `If $f(x) = ${m}x$, find $f(${x})$.`,
    options,
    correctIndex,
    explanation: bPart
      ? `$f(${x}) = ${m}(${x}) ${bPart} = ${correct}$`
      : `$f(${x}) = ${m}(${x}) = ${correct}$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m, b, highlightX: x, hideHighlight: true },
  };
}

function genParabolaVertex(rng: () => number, id: number): QuestionDraft {
  const h = pickInt(rng, -4, 4);
  const k = pickInt(rng, -6, 6);
  const correct = `$(${h}, ${k})$`;
  const signH = h >= 0 ? "-" : "+";
  const signK = k >= 0 ? "+" : "-";
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${-h}, ${k})$`,
    `$(${h}, ${-k})$`,
    `$(${k}, ${h})$`,
  ]);
  return {
    id,
    topic: "functions",
    prompt: `Identify the vertex of $y = (x ${signH} ${Math.abs(h)})^2 ${signK} ${Math.abs(k)}$.`,
    options,
    correctIndex,
    explanation: `Vertex form $y = (x - h)^2 + k$ gives vertex $(${h}, ${k})$`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_vertex", vertex: [h, k], hideHighlight: true },
  };
}

function genProjectileHeight(rng: () => number, id: number): QuestionDraft {
  const v0 = pickInt(rng, 8, 20);
  const t = pickInt(rng, 1, 4);
  const g = 10;
  const height = v0 * t - 0.5 * g * t * t;
  const correct = String(Math.max(0, height));
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(v0 * t),
    String(v0 + t),
    String(v0 * t + g),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `A ball is thrown upward at $${v0}\\,\\text{m/s}$. Using $g = 10\\,\\text{m/s}^2$, find its height after $${t}$ seconds: $h = v_0 t - \\frac{1}{2}gt^2$`,
    options,
    correctIndex,
    explanation: `$h = ${v0}(${t}) - \\frac{1}{2}(10)(${t})^2 = ${correct}$ m`,
    visualization: "matter_projectile",
    vizData: { angle: 75, velocity: v0 / 2 },
  };
}
