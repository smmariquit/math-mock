import type { Topic } from "../types";
import { buildOptions, formatFraction, pickFrom, pickInt } from "./utils";
import type { Generator, QuestionDraft } from "./bank";

function hintLines(...items: string[]): string[] {
  return items.slice(0, 3);
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

function vietaRoots(rng: () => number): { r1: number; r2: number; b: number; c: number } {
  const r1 = pickInt(rng, 1, 8);
  let r2 = pickInt(rng, -6, 9);
  if (r2 === 0) r2 = pickInt(rng, 2, 7);
  if (r2 === r1) r2 = r1 + pickInt(rng, 1, 3);
  return { r1, r2, b: -(r1 + r2), c: r1 * r2 };
}

// --- Rational functions ---

function genRationalEvaluate(rng: () => number, id: number): QuestionDraft {
  const numA = pickInt(rng, 1, 4);
  const numB = pickInt(rng, -5, 5);
  const denC = pickInt(rng, 1, 3);
  let denD = pickInt(rng, -6, 6);
  if (denD === 0) denD = 2;
  let x = pickInt(rng, -4, 8);
  while (denC * x + denD === 0) x = pickInt(rng, -4, 8);
  const value = (numA * x + numB) / (denC * x + denD);
  const correct = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const numStr = numB >= 0 ? `${numA}x + ${numB}` : `${numA}x - ${Math.abs(numB)}`;
  const denStr = denD >= 0 ? `${denC}x + ${denD}` : `${denC}x - ${Math.abs(denD)}`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Number(correct) + 1),
    String(numA + numB),
    String(Math.round(value * 2)),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `If $f(x) = \\dfrac{${numStr}}{${denStr}}$, find $f(${x})$.`,
    options,
    correctIndex,
    explanation: `$f(${x}) = \\dfrac{${numA * x + numB}}{${denC * x + denD}} = ${correct}$`,
    visualization: "none",
    hints: hintLines(
      `Substitute $x = ${x}$ into both numerator and denominator.`,
      `Numerator: $${numA}(${x}) ${formatLinear(numB)} = ${numA * x + numB}$.`,
      `Denominator: $${denC}(${x}) ${formatLinear(denD)} = ${denC * x + denD}$; divide to get ${correct}.`,
    ),
  };
}

function genRationalDomain(rng: () => number, id: number): QuestionDraft {
  const denC = pickFrom(rng, [1, 2, 3] as const);
  const excluded = pickInt(rng, -5, 5);
  const numB = pickInt(rng, 1, 6);
  const correct = `$x \\neq ${excluded}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$x \\neq ${-excluded}$`,
    `$x = ${excluded}$`,
    `$x \\neq ${excluded + 1}$`,
  ]);
  const denInner = excluded >= 0 ? `x - ${excluded}` : `x + ${Math.abs(excluded)}`;
  return {
    id,
    topic: "functions",
    prompt: `Find the domain of $f(x) = \\dfrac{${numB}}{${denC}(${denInner})}$.`,
    options,
    correctIndex,
    explanation: `Denominator $${denC}(${denInner}) = 0$ when $x = ${excluded}$; exclude that value.`,
    visualization: "none",
    hints: hintLines(
      "A rational function is undefined where its denominator equals zero.",
      `Set ${denC}(${denInner}) = 0 and solve for $x$.`,
      `The domain is all real numbers except $x = ${excluded}$.`,
    ),
  };
}

function genRationalAsymptote(rng: () => number, id: number): QuestionDraft {
  const a = pickInt(rng, 2, 8);
  const c = pickFrom(rng, [2, 3, 4] as const);
  const b = pickInt(rng, -4, 4);
  const d = pickInt(rng, -3, 3);
  const ratio = formatFraction(a, c);
  const correct = `$y = ${ratio}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$y = ${formatFraction(c, a)}$`,
    `$y = ${a + c}$`,
    `$x = ${formatFraction(a, c)}$`,
  ]);
  const numStr = b >= 0 ? `${a}x + ${b}` : `${a}x - ${Math.abs(b)}`;
  const denStr = d >= 0 ? `${c}x + ${d}` : `${c}x - ${Math.abs(d)}`;
  return {
    id,
    topic: "functions",
    prompt: `Find the horizontal asymptote of $f(x) = \\dfrac{${numStr}}{${denStr}}$.`,
    options,
    correctIndex,
    explanation: `Degrees are equal; horizontal asymptote is ratio of leading coefficients: $y = \\dfrac{${a}}{${c}} = ${ratio}$.`,
    visualization: "none",
    hints: hintLines(
      "For equal-degree numerator and denominator, compare leading coefficients.",
      `Leading terms: $${a}x$ over $${c}x$.`,
      `Horizontal asymptote: $y = \\dfrac{${a}}{${c}} = ${ratio}$.`,
    ),
  };
}

// --- Exponential functions ---

function genExponentialEvaluate(rng: () => number, id: number): QuestionDraft {
  const base = pickFrom(rng, [2, 3, 5] as const);
  const coeff = pickFrom(rng, [1, 2, 3] as const);
  const x = pickInt(rng, 2, 4);
  const correct = String(coeff * base ** x);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(coeff + base ** x),
    String(coeff * base * x),
    String(base ** (x + 1)),
  ]);
  return {
    id,
    topic: "functions",
    prompt: `If $f(x) = ${coeff} \\cdot ${base}^x$, find $f(${x})$.`,
    options,
    correctIndex,
    explanation: `$f(${x}) = ${coeff} \\cdot ${base}^{${x}} = ${coeff} \\cdot ${base ** x} = ${correct}$`,
    visualization: "none",
    hints: hintLines(
      `Replace $x$ with ${x} in $f(x) = ${coeff} \\cdot ${base}^x$.`,
      `Compute ${base}^{${x}} = ${base ** x}$ first.`,
      `Multiply by ${coeff}: ${coeff} \\times ${base ** x} = ${correct}$.`,
    ),
  };
}

function genExponentialGrowthDecay(rng: () => number, id: number): QuestionDraft {
  const growth = rng() > 0.5;
  const base = growth ? pickFrom(rng, [2, 3] as const) : 2;
  const p0 = pickInt(rng, 50, 200);
  const t = pickInt(rng, 2, 4);
  const correct = growth ? String(p0 * base ** t) : String(Math.round(p0 * (0.5 ** t)));
  const rule = growth ? `${base}^t` : `(\\tfrac{1}{2})^t`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(p0 + t),
    String(p0 * t),
    growth ? String(p0 * base * t) : String(p0 - t * 10),
  ]);
  return {
    id,
    topic: "functions",
    prompt: growth
      ? `A quantity starts at ${p0} and grows by a factor of ${base} each hour. Find the amount after ${t} hours: $A = ${p0} \\cdot ${base}^t$.`
      : `A substance with mass ${p0} g halves every hour. Find the mass after ${t} hours: $A = ${p0} \\cdot (\\tfrac{1}{2})^t$.`,
    options,
    correctIndex,
    explanation: `$A = ${p0} \\cdot ${rule.replace("t", String(t))} = ${correct}$`,
    visualization: "none",
    hints: hintLines(
      growth
        ? `Each hour multiply by ${base}; after ${t} hours multiply ${t} times.`
        : `Each hour multiply by $\\tfrac{1}{2}$; after ${t} hours apply halving ${t} times.`,
      `Start with ${p0}, then apply the factor for $t = ${t}$.`,
      `Result: ${correct}.`,
    ),
  };
}

function genExponentialIdentifyType(rng: () => number, id: number): QuestionDraft {
  const items = [
    {
      fn: "$f(x) = 3 \\cdot 2^x$",
      correct: "Exponential growth",
      wrong: ["Linear function", "Rational function", "Quadratic function"],
      hint: "The variable is in the exponent with a positive base greater than 1.",
    },
    {
      fn: "$g(x) = \\dfrac{x + 1}{x - 2}$",
      correct: "Rational function",
      wrong: ["Exponential function", "Polynomial of degree 2", "Absolute value function"],
      hint: "A ratio of two polynomials defines a rational function.",
    },
    {
      fn: "$h(x) = 5x - 7$",
      correct: "Linear function",
      wrong: ["Exponential decay", "Rational function", "Cubic function"],
      hint: "The variable appears to the first power only — degree 1.",
    },
  ];
  const item = pickFrom(rng, items);
  const { options, correctIndex } = buildOptions(rng, item.correct, item.wrong);
  return {
    id,
    topic: "functions",
    prompt: `Classify the function: ${item.fn}`,
    options,
    correctIndex,
    explanation: `${item.fn} is a ${item.correct.toLowerCase()}.`,
    visualization: "none",
    hints: hintLines(
      item.hint,
      "Linear: $mx + b$. Exponential: $a \\cdot b^x$. Rational: polynomial over polynomial.",
      `Match the form of ${item.fn} to the correct family.`,
    ),
  };
}

// --- Vieta's identities ---

function genVietaSum(rng: () => number, id: number): QuestionDraft {
  const { r1, r2, b, c } = vietaRoots(rng);
  const sum = r1 + r2;
  const correct = String(sum);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(-sum),
    String(c),
    String(r1 * r2),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `For ${formatQuadraticPrompt(b, c)}, find the sum of the roots (Vieta).`,
    options,
    correctIndex,
    explanation: `$r_1 + r_2 = -\\dfrac{b}{a} = -(${b}) = ${sum}$`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
    hints: hintLines(
      "Vieta: for $x^2 + bx + c = 0$, sum of roots equals $-b$.",
      `Here $b = ${b}$, so $r_1 + r_2 = -(${b}) = ${sum}$.`,
      `Verify: roots ${r1} and ${r2} add to ${sum}.`,
    ),
  };
}

function genVietaProduct(rng: () => number, id: number): QuestionDraft {
  const { r1, r2, b, c } = vietaRoots(rng);
  const correct = String(c);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(-c),
    String(r1 + r2),
    String(r1 + r2 + c),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `For ${formatQuadraticPrompt(b, c)}, find the product of the roots (Vieta).`,
    options,
    correctIndex,
    explanation: `$r_1 \\cdot r_2 = \\dfrac{c}{a} = ${c}$`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
    hints: hintLines(
      "Vieta: for $x^2 + bx + c = 0$, product of roots equals $c$.",
      `Constant term $c = ${c}$, so $r_1 \\cdot r_2 = ${c}$.`,
      `Check: ${r1} \\times ${r2} = ${c}.`,
    ),
  };
}

function genVietaSumOfSquares(rng: () => number, id: number): QuestionDraft {
  const { r1, r2, b, c } = vietaRoots(rng);
  const sum = r1 + r2;
  const correct = String(sum * sum - 2 * c);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(sum * sum),
    String(c * c),
    String(sum + c),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Roots of ${formatQuadraticPrompt(b, c)} satisfy $r_1 + r_2 = ${sum}$ and $r_1 r_2 = ${c}$. Find $r_1^2 + r_2^2$.`,
    options,
    correctIndex,
    explanation: `$r_1^2 + r_2^2 = (r_1+r_2)^2 - 2r_1 r_2 = ${sum}^2 - 2(${c}) = ${correct}$`,
    visualization: "none",
    hints: hintLines(
      "Use the identity $r_1^2 + r_2^2 = (r_1 + r_2)^2 - 2r_1 r_2$.",
      `Substitute $r_1 + r_2 = ${sum}$ and $r_1 r_2 = ${c}$.`,
      `$(${sum})^2 - 2(${c}) = ${sum * sum} - ${2 * c} = ${correct}$.`,
    ),
  };
}

function genVietaReciprocalSum(rng: () => number, id: number): QuestionDraft {
  const { r1, r2, b, c } = vietaRoots(rng);
  const sum = r1 + r2;
  const num = sum;
  const den = c;
  const correct = `$\\dfrac{${num}}{${den}}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$\\dfrac{${den}}{${num}}$`,
    `$\\dfrac{1}{${c}}$`,
    `$${formatFraction(num, den + 1)}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `For ${formatQuadraticPrompt(b, c)}, with roots $r_1, r_2$, find $\\dfrac{1}{r_1} + \\dfrac{1}{r_2}$.`,
    options,
    correctIndex,
    explanation: `$\\dfrac{1}{r_1}+\\dfrac{1}{r_2} = \\dfrac{r_1+r_2}{r_1 r_2} = \\dfrac{${sum}}{${c}}$`,
    visualization: "none",
    hints: hintLines(
      "Combine fractions: $\\dfrac{1}{r_1} + \\dfrac{1}{r_2} = \\dfrac{r_1 + r_2}{r_1 r_2}$.",
      `Use Vieta: numerator $= ${sum}$, denominator $= ${c}$.`,
      `Answer: $\\dfrac{${num}}{${den}}$.`,
    ),
  };
}

// --- Triangle similarity ---

function genSimilarTrianglesSide(rng: () => number, id: number): QuestionDraft {
  const k = pickInt(rng, 2, 4);
  const sideSmall = pickInt(rng, 4, 10);
  const sideLarge = sideSmall * k;
  const askLarge = rng() > 0.5;
  const correct = askLarge ? String(sideLarge) : String(sideSmall);
  const given = askLarge ? sideSmall : sideLarge;
  const fromTri = askLarge ? "smaller" : "larger";
  const toTri = askLarge ? "larger" : "smaller";
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Number(correct) + k),
    String(Math.round(Number(correct) / k)),
    String(Number(correct) + 2),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Two similar triangles have scale factor $${k}:1$ (${fromTri} to ${toTri}). A side of ${given} in the ${fromTri} triangle corresponds to what side in the ${toTri} triangle?`,
    options,
    correctIndex,
    explanation: `Corresponding sides scale by ${k}: ${fromTri} $\\to$ ${toTri} gives ${correct}.`,
    visualization: "triangle",
    vizData: { kind: "similar", scale: k, side: sideSmall, hideBigSide: true },
    hints: hintLines(
      `Scale factor ${k} means ${toTri} side = ${k} $\\times$ ${fromTri} side (or divide if going down).`,
      `Given side ${given} is on the ${fromTri} triangle.`,
      `Corresponding ${toTri} side $= ${correct}$.`,
    ),
  };
}

function genSimilarTrianglesAA(rng: () => number, id: number): QuestionDraft {
  const angleA = pickFrom(rng, [50, 60, 70] as const);
  const angleB = pickFrom(rng, [40, 50, 60] as const);
  const angleC = 180 - angleA - angleB;
  const baseSmall = pickInt(rng, 6, 10);
  const k = pickInt(rng, 2, 3);
  const baseLarge = baseSmall * k;
  const correct = String(baseLarge);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(baseSmall),
    String(baseSmall + k),
    String(baseLarge + 2),
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Two triangles are similar (AA). The smaller has angles $${angleA}°$, $${angleB}°$, $${angleC}°$ and base $${baseSmall}$. The larger triangle is ${k} times bigger. Find the corresponding base.`,
    options,
    correctIndex,
    explanation: `AA similarity gives scale factor ${k}; base $= ${baseSmall} \\times ${k} = ${correct}$.`,
    visualization: "triangle",
    vizData: { kind: "similar", scale: k, side: baseSmall, hideBigSide: true },
    hints: hintLines(
      "AA (two matching angles) proves triangles similar.",
      `Linear scale factor ${k} applies to every pair of corresponding sides.`,
      `Base in larger triangle $= ${baseSmall} \\times ${k} = ${correct}$.`,
    ),
  };
}

// --- Algebraic inequalities ---

function genAbsoluteValueInequality(rng: () => number, id: number): QuestionDraft {
  const lo = pickInt(rng, 0, 4);
  const hi = lo + pickInt(rng, 3, 6);
  const a = pickFrom(rng, [1, 2] as const);
  const mid = (lo + hi) / 2;
  const halfWidth = (hi - lo) / 2;
  const B = a * mid;
  const C = a * halfWidth;
  const correct = `$${lo} \\leq x \\leq ${hi}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$x \\leq ${hi}$`,
    `$x \\geq ${lo}$`,
    `$${lo} < x < ${hi}$`,
  ]);
  const inner = B >= 0 ? `${a}x - ${B}` : `${a}x + ${Math.abs(B)}`;
  return {
    id,
    topic: "algebra",
    prompt: `Solve: $|${inner}| \\leq ${C}$`,
    options,
    correctIndex,
    explanation: `$|${inner}| \\leq ${C} \\iff ${lo} \\leq x \\leq ${hi}$`,
    visualization: "none",
    hints: hintLines(
      "Rewrite as $-C \\leq ax + b \\leq C$ and solve for $x$.",
      `Add/subtract to isolate $x$, then divide by ${a}.`,
      `Solution: $${lo} \\leq x \\leq ${hi}$.`,
    ),
  };
}

function genCompoundLinearInequality(rng: () => number, id: number): QuestionDraft {
  const lo = pickInt(rng, 1, 4);
  const hi = lo + pickInt(rng, 3, 6);
  const m = pickFrom(rng, [2, 3] as const);
  const c1 = m * lo;
  const c2 = m * hi;
  const correct = `$${lo} \\leq x \\leq ${hi}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$x \\geq ${lo}$`,
    `$${lo} < x < ${hi}$`,
    `$x \\leq ${hi}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Solve: $${c1} \\leq ${m}x \\leq ${c2}$`,
    options,
    correctIndex,
    explanation: `Divide all parts by ${m}: $${lo} \\leq x \\leq ${hi}$`,
    visualization: "none",
    hints: hintLines(
      "Isolate $x$ in the middle — apply the same operation to all three parts.",
      `Divide every part by ${m}.`,
      `Solution interval: $[${lo}, ${hi}]$.`,
    ),
  };
}

function genQuadraticInequalityAdvanced(rng: () => number, id: number): QuestionDraft {
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
    prompt: `Solve: $(x - ${r1})(x - ${r2}) > 0$`,
    options,
    correctIndex,
    explanation: `Parabola opens up; product positive outside the roots: $x < ${r1}$ or $x > ${r2}$.`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_roots", c, roots: [r1, r2], hideRoots: true },
    hints: hintLines(
      "Find roots from factors: $x = ${r1}$ and $x = ${r2}$.",
      "Sketch or test intervals; leading coefficient is positive.",
      "Product $> 0$ outside the roots: $x < ${r1}$ or $x > ${r2}$.",
    ),
  };
}

// --- Circle geometry ---

function genCircleCircumference(rng: () => number, id: number): QuestionDraft {
  const r = pickInt(rng, 3, 12);
  const correct = `${2 * r}\\pi`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `${r * r}\\pi`,
    `${r}\\pi`,
    `${4 * r}\\pi`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the circumference of a circle with radius $${r}$.`,
    options,
    correctIndex,
    explanation: `$C = 2\\pi r = 2\\pi(${r}) = ${2 * r}\\pi$`,
    visualization: "circle",
    vizData: { kind: "circle", r },
    hints: hintLines(
      "Circumference formula: $C = 2\\pi r$.",
      `Substitute $r = ${r}$.`,
      `$C = ${2 * r}\\pi$ — do not use $\\pi r^2$ (that is area).`,
    ),
  };
}

function genCircleArcLength(rng: () => number, id: number): QuestionDraft {
  const r = pickInt(rng, 4, 10);
  const deg = pickFrom(rng, [60, 90, 120, 180] as const);
  let answer: string;
  if (deg === 90) answer = `$\\dfrac{${r}\\pi}{2}$`;
  else if (deg === 180) answer = `$${r}\\pi$`;
  else if (deg === 60) answer = `$\\dfrac{${r}\\pi}{3}$`;
  else answer = `$\\dfrac{${2 * r}\\pi}{3}$`;
  const { options, correctIndex } = buildOptions(rng, answer, [
    `$${r * r}\\pi$`,
    `$\\dfrac{${r}\\pi}{4}$`,
    `$${2 * r}\\pi$`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `A circle of radius $${r}$ has a central angle of $${deg}°$. Find the arc length.`,
    options,
    correctIndex,
    explanation: `$s = \\dfrac{${deg}}{360} \\cdot 2\\pi(${r}) = ${answer}$`,
    visualization: "circle",
    vizData: { kind: "circle", r },
    hints: hintLines(
      "Arc length: $s = \\dfrac{\\theta}{360°} \\times 2\\pi r$.",
      `Here $\\theta = ${deg}°$ and $r = ${r}$.`,
      `Compute $\\dfrac{${deg}}{360} \\times 2\\pi(${r})$.`,
    ),
  };
}

function genCircleSectorArea(rng: () => number, id: number): QuestionDraft {
  const r = pickInt(rng, 3, 9);
  const deg = pickFrom(rng, [90, 120, 180] as const);
  let answer: string;
  if (deg === 90) answer = `$\\dfrac{${r * r}\\pi}{4}$`;
  else if (deg === 180) answer = `$\\dfrac{${r * r}\\pi}{2}$`;
  else answer = `$\\dfrac{${r * r}\\pi}{3}$`;
  const { options, correctIndex } = buildOptions(rng, answer, [
    `$${r * r}\\pi$`,
    `$\\dfrac{${r}\\pi}{2}$`,
    `$\\dfrac{${2 * r}\\pi}{3}$`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Find the area of a sector with radius $${r}$ and central angle $${deg}°$.`,
    options,
    correctIndex,
    explanation: `$A = \\dfrac{${deg}}{360} \\pi r^2 = ${answer}$`,
    visualization: "circle",
    vizData: { kind: "circle", r },
    hints: hintLines(
      "Sector area: $A = \\dfrac{\\theta}{360°} \\pi r^2$.",
      `$r = ${r}$, so $\\pi r^2 = ${r * r}\\pi$.`,
      `Take $\\dfrac{${deg}}{360}$ of the full circle area.`,
    ),
  };
}

function genCircleEquation(rng: () => number, id: number): QuestionDraft {
  const h = pickInt(rng, -3, 3);
  const k = pickInt(rng, -3, 3);
  const r = pickInt(rng, 2, 6);
  const signH = h >= 0 ? "-" : "+";
  const signK = k >= 0 ? "-" : "+";
  const correct = `$(${h}, ${k})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${-h}, ${k})$`,
    `$(${h}, ${-k})$`,
    `$(${r}, ${h})$`,
  ]);
  return {
    id,
    topic: "geometry",
    prompt: `Identify the center of the circle $(x ${signH} ${Math.abs(h)})^2 + (y ${signK} ${Math.abs(k)})^2 = ${r * r}$.`,
    options,
    correctIndex,
    explanation: `Standard form $(x - h)^2 + (y - k)^2 = r^2$ gives center $(${h}, ${k})$.`,
    visualization: "circle",
    vizData: { kind: "circle", r },
    hints: hintLines(
      "Compare to $(x - h)^2 + (y - k)^2 = r^2$.",
      `$(x ${signH} ${Math.abs(h)})$ means $h = ${h}$; $(y ${signK} ${Math.abs(k)})$ means $k = ${k}$.`,
      `Center $= (${h}, ${k})$.`,
    ),
  };
}

// --- Linear & quadratic forms ---

function genSlopeInterceptForm(rng: () => number, id: number): QuestionDraft {
  let m = pickInt(rng, -4, 4);
  while (m === 0) m = pickInt(rng, -4, 4);
  const b = pickInt(rng, -6, 6);
  const askSlope = rng() > 0.5;
  const correct = askSlope ? String(m) : String(b);
  const bPart = formatLinear(b);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(Number(correct) + 1),
    String(Number(correct) - 1),
    String(m + b),
  ]);
  return {
    id,
    topic: "algebra",
    prompt: askSlope
      ? `In slope-intercept form $y = ${m}x ${bPart}$, what is the slope?`
      : `In slope-intercept form $y = ${m}x ${bPart}$, what is the $y$-intercept?`,
    options,
    correctIndex,
    explanation: askSlope
      ? `Slope-intercept $y = mx + b$ has slope $m = ${m}$.`
      : `$y$-intercept is $b = ${b}$ (when $x = 0$).`,
    visualization: "coordinate",
    vizData: { kind: "linear", m, b, hideHighlight: true },
    hints: hintLines(
      "Slope-intercept form: $y = mx + b$.",
      askSlope ? `$m$ is the coefficient of $x$.` : `$b$ is the constant term (value at $x = 0$).`,
      askSlope ? `Slope $= ${m}$.` : `$y$-intercept $= ${b}$.`,
    ),
  };
}

function genStandardToSlopeIntercept(rng: () => number, id: number): QuestionDraft {
  const m = pickFrom(rng, [2, 3, -2] as const);
  const b = pickInt(rng, 1, 6);
  const A = -m;
  const B = 1;
  const C = b;
  const correct = `$y = ${m}x ${formatLinear(b)}$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$y = ${-m}x ${formatLinear(b)}$`,
    `$y = ${m}x ${formatLinear(-b)}$`,
    `$y = ${formatFraction(m, 2)}x ${formatLinear(b)}$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Write in slope-intercept form: $${A}x + ${B}y = ${C}$`,
    options,
    correctIndex,
    explanation: `Solve for $y$: $y = ${m}x ${formatLinear(b)}$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m, b, hideHighlight: true },
    hints: hintLines(
      `Isolate $y$ in $${A}x + y = ${C}$.`,
      `Subtract ${A}x from both sides, then divide by ${B}.`,
      `Result: $y = ${m}x ${formatLinear(b)}$.`,
    ),
  };
}

function genQuadraticVertexForm(rng: () => number, id: number): QuestionDraft {
  const h = pickInt(rng, -4, 4);
  const k = pickInt(rng, -5, 8);
  const signH = h >= 0 ? "-" : "+";
  const signK = k >= 0 ? "+" : "-";
  const correct = `$(${h}, ${k})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$(${-h}, ${k})$`,
    `$(${h}, ${-k})$`,
    `$(${k}, ${h})$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Identify the vertex of $y = (x ${signH} ${Math.abs(h)})^2 ${signK} ${Math.abs(k)}$.`,
    options,
    correctIndex,
    explanation: `Vertex form $y = (x - h)^2 + k$ gives vertex $(${h}, ${k})$.`,
    visualization: "coordinate",
    vizData: { kind: "quadratic_vertex", vertex: [h, k], hideHighlight: true },
    hints: hintLines(
      "Vertex form: $y = (x - h)^2 + k$ has vertex $(h, k)$.",
      `$(x ${signH} ${Math.abs(h)})^2$ means $h = ${h}$.`,
      `Constant term ${signK} ${Math.abs(k)} gives $k = ${k}$.`,
    ),
  };
}

function genQuadraticFormIdentify(rng: () => number, id: number): QuestionDraft {
  const items = [
    {
      eq: "$y = 2x^2 - 4x + 1$",
      correct: "Standard form",
      wrong: ["Vertex form", "Factored form", "Intercept form"],
    },
    {
      eq: "$y = (x - 3)^2 + 2$",
      correct: "Vertex form",
      wrong: ["Standard form", "Factored form", "Point-slope form"],
    },
    {
      eq: "$y = (x + 1)(x - 5)$",
      correct: "Factored form",
      wrong: ["Vertex form", "Standard form", "Slope-intercept form"],
    },
  ];
  const item = pickFrom(rng, items);
  const { options, correctIndex } = buildOptions(rng, item.correct, item.wrong);
  return {
    id,
    topic: "algebra",
    prompt: `Which description best fits ${item.eq}?`,
    options,
    correctIndex,
    explanation: `${item.eq} is in ${item.correct.toLowerCase()}.`,
    visualization: "none",
    hints: hintLines(
      "Standard: $ax^2+bx+c$. Vertex: $a(x-h)^2+k$. Factored: $a(x-r_1)(x-r_2)$.",
      `Look at how ${item.eq} is written.`,
      `It matches ${item.correct.toLowerCase()}.`,
    ),
  };
}

function genPointSlopeForm(rng: () => number, id: number): QuestionDraft {
  const m = pickInt(rng, 2, 5);
  const x1 = pickInt(rng, 1, 4);
  const y1 = pickInt(rng, 2, 8);
  const b = y1 - m * x1;
  const correct = `$y - ${y1} = ${m}(x - ${x1})$`;
  const { options, correctIndex } = buildOptions(rng, correct, [
    `$y - ${x1} = ${m}(x - ${y1})$`,
    `$y = ${m}x - ${m * x1 - y1}$`,
    `$y - ${y1} = ${m + 1}(x - ${x1})$`,
  ]);
  return {
    id,
    topic: "algebra",
    prompt: `Write the point-slope equation of the line through $(${x1}, ${y1})$ with slope $${m}$.`,
    options,
    correctIndex,
    explanation: `Point-slope: $y - y_1 = m(x - x_1) = y - ${y1} = ${m}(x - ${x1})$`,
    visualization: "coordinate",
    vizData: { kind: "linear", m, b, hideHighlight: true },
    hints: hintLines(
      "Point-slope formula: $y - y_1 = m(x - x_1)$.",
      `Substitute $(x_1, y_1) = (${x1}, ${y1})$ and $m = ${m}$.`,
      `Answer: $y - ${y1} = ${m}(x - ${x1})$.`,
    ),
  };
}

// --- Exports ---

export const extendedStandardGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "functions", fn: genExponentialEvaluate },
  { topic: "functions", fn: genRationalEvaluate },
  { topic: "algebra", fn: genSlopeInterceptForm },
  { topic: "algebra", fn: genQuadraticVertexForm },
  { topic: "geometry", fn: genCircleCircumference },
  { topic: "geometry", fn: genSimilarTrianglesSide },
];

export const extendedAdvancedGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "functions", fn: genRationalEvaluate },
  { topic: "functions", fn: genRationalDomain },
  { topic: "functions", fn: genRationalAsymptote },
  { topic: "functions", fn: genExponentialEvaluate },
  { topic: "functions", fn: genExponentialGrowthDecay },
  { topic: "functions", fn: genExponentialIdentifyType },
  { topic: "algebra", fn: genVietaSum },
  { topic: "algebra", fn: genVietaProduct },
  { topic: "algebra", fn: genVietaSumOfSquares },
  { topic: "algebra", fn: genVietaReciprocalSum },
  { topic: "geometry", fn: genSimilarTrianglesSide },
  { topic: "geometry", fn: genSimilarTrianglesAA },
  { topic: "algebra", fn: genAbsoluteValueInequality },
  { topic: "algebra", fn: genCompoundLinearInequality },
  { topic: "algebra", fn: genQuadraticInequalityAdvanced },
  { topic: "geometry", fn: genCircleCircumference },
  { topic: "geometry", fn: genCircleArcLength },
  { topic: "geometry", fn: genCircleSectorArea },
  { topic: "geometry", fn: genCircleEquation },
  { topic: "algebra", fn: genSlopeInterceptForm },
  { topic: "algebra", fn: genStandardToSlopeIntercept },
  { topic: "algebra", fn: genPointSlopeForm },
  { topic: "algebra", fn: genQuadraticVertexForm },
  { topic: "algebra", fn: genQuadraticFormIdentify },
];
