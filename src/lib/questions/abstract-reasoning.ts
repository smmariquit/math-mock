import type { Topic } from "../types";
import { buildOptions, pickFrom, pickInt, shuffleWithRng } from "./utils";
import type { Generator, QuestionDraft } from "./bank";

export type AbstractShape = "circle" | "square" | "triangle" | "diamond";

export interface AbstractCell {
  shape: AbstractShape;
  filled: boolean;
  rotation: number;
  dots?: number;
}

function hintLines(...items: string[]): string[] {
  return items.slice(0, 3);
}

function encodeCell(cell: AbstractCell): string {
  if (cell.dots !== undefined) return `dots:${cell.dots}`;
  return `${cell.shape}:${cell.filled ? 1 : 0}:${cell.rotation}`;
}

function decodeCell(raw: string): AbstractCell {
  if (raw.startsWith("dots:")) {
    return { shape: "circle", filled: true, rotation: 0, dots: Number(raw.slice(5)) };
  }
  const [shape, filled, rotation] = raw.split(":");
  return {
    shape: shape as AbstractShape,
    filled: filled === "1",
    rotation: Number(rotation) || 0,
  };
}

function buildShapeOptions(
  rng: () => number,
  correct: AbstractCell,
  wrong: AbstractCell[],
): { options: string[]; correctIndex: number; optionShapes: AbstractCell[] } {
  const labeled = [correct, ...wrong].map((cell) => ({ cell, label: shapeLabel(cell) }));
  const shuffled = shuffleWithRng(rng, labeled);
  return {
    options: shuffled.map((item) => item.label),
    correctIndex: shuffled.findIndex((item) => item.cell === correct),
    optionShapes: shuffled.map((item) => item.cell),
  };
}

export function parseAbstractCells(raw: string[] | undefined): AbstractCell[] {
  return (raw ?? []).map(decodeCell);
}

function shapeLabel(cell: AbstractCell): string {
  if (cell.dots !== undefined) return `${cell.dots} dots`;
  const name = cell.shape.charAt(0).toUpperCase() + cell.shape.slice(1);
  const fill = cell.filled ? "filled" : "hollow";
  const rot = cell.rotation % 360;
  if (rot === 0) return `${fill} ${name}`;
  return `${fill} ${name}, rotated ${rot}°`;
}

function abstractViz(
  kind: "sequence" | "matrix" | "choices",
  cells: AbstractCell[],
  matrixCols?: number,
  optionShapes?: AbstractCell[],
): QuestionDraft["vizData"] {
  const data: Record<string, unknown> = {
    kind,
    cells: cells.map(encodeCell),
  };
  if (matrixCols !== undefined) data.matrixCols = matrixCols;
  if (optionShapes) data.optionShapes = optionShapes.map(encodeCell);
  return data;
}

function genLetterSkipSequence(rng: () => number, id: number): QuestionDraft {
  const start = pickInt(rng, 0, 10);
  const skip = pickFrom(rng, [2, 3] as const);
  const seq = Array.from({ length: 4 }, (_, i) => String.fromCharCode(65 + start + i * skip));
  const next = String.fromCharCode(65 + start + 4 * skip);
  const wrong = [
    String.fromCharCode(65 + start + 4 * skip + 1),
    String.fromCharCode(65 + start + 3 * skip),
    String.fromCharCode(65 + start + 4 * skip - 1),
  ];
  const { options, correctIndex } = buildOptions(rng, next, wrong);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `What letter comes next? ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: `Each letter skips ${skip - 1} letter(s): step of ${skip} in the alphabet → ${next}.`,
    visualization: "none",
    hints: hintLines(
      `List the given letters: ${seq.join(", ")}. Find how many alphabet steps separate each pair.`,
      skip === 2
        ? "Each letter is 2 positions after the previous (skip 1 letter between them)."
        : "Each letter is 3 positions after the previous (skip 2 letters between them).",
      `After ${seq[3]}, advance ${skip} more positions in the alphabet to get ${next}.`,
    ),
  };
}

function genVerbalAnalogy(rng: () => number, id: number): QuestionDraft {
  const pairs = [
    {
      a: "Bird",
      b: "Nest",
      c: "Dog",
      answer: "Kennel",
      wrong: ["Bone", "Tree", "Paw"],
      hints: hintLines(
        "A nest is where a bird lives — what is the matching home for a dog?",
        "Bone and paw are parts of a dog; tree is unrelated.",
        "Choose the shelter word that completes the same animal-to-home link.",
      ),
    },
    {
      a: "Author",
      b: "Book",
      c: "Composer",
      answer: "Symphony",
      wrong: ["Piano", "Stage", "Note"],
      hints: hintLines(
        "An author produces a book; a composer produces a major musical work.",
        "Piano and note are tools or parts, not the finished creation.",
        "Symphony is the large-scale work a composer creates, like a book for an author.",
      ),
    },
    {
      a: "Teacher",
      b: "School",
      c: "Doctor",
      answer: "Hospital",
      wrong: ["Medicine", "Patient", "Stethoscope"],
      hints: hintLines(
        "Teacher is linked to the place they work: a school.",
        "Medicine and stethoscope are tools; patient is a person served, not the workplace.",
        "A doctor's primary workplace is a hospital, just as a teacher's is a school.",
      ),
    },
    {
      a: "Wheel",
      b: "Bicycle",
      c: "Engine",
      answer: "Car",
      wrong: ["Road", "Fuel", "Garage"],
      hints: hintLines(
        "A wheel is an essential part of a bicycle — what whole thing needs an engine?",
        "Fuel powers an engine; road and garage are locations, not vehicles.",
        "An engine is a key part of a car, matching wheel to bicycle.",
      ),
    },
    {
      a: "Finger",
      b: "Hand",
      c: "Leaf",
      answer: "Tree",
      wrong: ["Branch", "Root", "Soil"],
      hints: hintLines(
        "A finger is a part of a hand — what whole thing is a leaf part of?",
        "Branch and root are also parts of a tree, not the whole organism.",
        "Soil is where a tree grows, not the tree itself.",
      ),
    },
  ];
  const item = pickFrom(rng, pairs);
  const { options, correctIndex } = buildOptions(rng, item.answer, item.wrong);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `${item.a} is to ${item.b} as ${item.c} is to ?`,
    options,
    correctIndex,
    explanation: `${item.a} belongs with ${item.b}; likewise ${item.c} belongs with ${item.answer}.`,
    visualization: "none",
    hints: item.hints,
  };
}

function genOddOneOut(rng: () => number, id: number): QuestionDraft {
  const sets = [
    {
      items: ["Triangle", "Square", "Circle", "Monday"],
      answer: "Monday",
      reason: "Monday is a day, not a shape.",
      hints: hintLines(
        "Three choices are geometric shapes; one names something else entirely.",
        "Triangle, square, and circle all describe 2D figures.",
        "Monday is a day of the week — it does not belong with shapes.",
      ),
    },
    {
      items: ["2", "4", "8", "10"],
      answer: "10",
      reason: "10 is not a power of 2.",
      hints: hintLines(
        "Check whether each number fits the same numeric rule.",
        "2, 4, and 8 are powers of 2: $2^1, 2^2, 2^3$.",
        "10 cannot be written as $2^n$ for a whole number $n$.",
      ),
    },
    {
      items: ["Rose", "Tulip", "Oak", "Daisy"],
      answer: "Oak",
      reason: "Oak is a tree; the others are flowers.",
      hints: hintLines(
        "Three are common garden flowers; one is a type of tree.",
        "Rose, tulip, and daisy are flowering plants grown for blooms.",
        "Oak is a tree species — it breaks the flower group.",
      ),
    },
    {
      items: ["Run", "Jump", "Swim", "Table"],
      answer: "Table",
      reason: "Table is not a verb of motion.",
      hints: hintLines(
        "Three words describe ways of moving your body.",
        "Run, jump, and swim are all physical actions / verbs.",
        "Table is a noun — a piece of furniture — not a motion verb.",
      ),
    },
  ];
  const item = pickFrom(rng, sets);
  const { options, correctIndex } = buildOptions(rng, item.answer, item.items.filter((x) => x !== item.answer));
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `Which does NOT belong with the others?`,
    options,
    correctIndex,
    explanation: item.reason,
    visualization: "none",
    hints: item.hints,
  };
}

function genNumberPattern(rng: () => number, id: number): QuestionDraft {
  const kind = pickFrom(rng, ["arithmetic", "geometric", "square"] as const);
  let seq: number[];
  let next: number;
  let rule: string;
  let itemHints: string[];

  if (kind === "arithmetic") {
    const start = pickInt(rng, 2, 12);
    const diff = pickInt(rng, 3, 7);
    seq = Array.from({ length: 4 }, (_, i) => start + i * diff);
    next = start + 4 * diff;
    rule = `Add ${diff} each time.`;
    itemHints = hintLines(
      `Find the difference between consecutive terms: ${seq[1]! - seq[0]!}, ${seq[2]! - seq[1]!}, ${seq[3]! - seq[2]!}.`,
      `Each term increases by a constant ${diff}.`,
      `Add ${diff} to ${seq[3]} to get ${next}.`,
    );
  } else if (kind === "geometric") {
    const start = pickInt(rng, 2, 4);
    const ratio = pickFrom(rng, [2, 3] as const);
    seq = Array.from({ length: 4 }, (_, i) => start * ratio ** i);
    next = start * ratio ** 4;
    rule = `Multiply by ${ratio} each time.`;
    itemHints = hintLines(
      `Divide each term by the previous: ${seq[1]! / seq[0]!}, ${seq[2]! / seq[1]!}, ${seq[3]! / seq[2]!}.`,
      `Each term is multiplied by ${ratio} to get the next.`,
      `${seq[3]} $\\times$ ${ratio} $=$ ${next}.`,
    );
  } else {
    const base = pickInt(rng, 2, 5);
    seq = [1, 2, 3, 4].map((n) => (base + n - 1) ** 2);
    next = (base + 4) ** 2;
    rule = `Consecutive squares starting at ${base}^2.`;
    itemHints = hintLines(
      `Try square roots: $\\sqrt{${seq[0]}}=${base}$, $\\sqrt{${seq[1]}}=${base + 1}$, $\\sqrt{${seq[2]}}=${base + 2}$, $\\sqrt{${seq[3]}}=${base + 3}$.`,
      "The bases increase by 1 each step: consecutive perfect squares.",
      `Next is $(${base + 4})^2 = ${next}$.`,
    );
  }

  const correct = String(next);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(next + pickInt(rng, 2, 5)),
    String(next - pickInt(rng, 2, 4)),
    String(next + pickInt(rng, 6, 10)),
  ]);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `What number comes next? ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: rule,
    visualization: "none",
    hints: itemHints,
  };
}

function genTriangularDots(rng: () => number, id: number): QuestionDraft {
  const seq = [1, 3, 6, 10];
  const next = 15;
  const cells = seq.map((n) => ({ shape: "circle" as const, filled: true, rotation: 0, dots: n }));
  const correctCell: AbstractCell = { shape: "circle", filled: true, rotation: 0, dots: next };
  const wrongCells: AbstractCell[] = [
    { shape: "circle", filled: true, rotation: 0, dots: 14 },
    { shape: "circle", filled: true, rotation: 0, dots: 12 },
    { shape: "circle", filled: true, rotation: 0, dots: 16 },
  ];
  const { options, correctIndex, optionShapes } = buildShapeOptions(rng, correctCell, wrongCells);

  return {
    id,
    topic: "abstract_reasoning",
    prompt: "Each figure adds one more row of dots (triangular numbers). What comes next?",
    options,
    correctIndex,
    explanation: "Triangular numbers: 1, 3, 6, 10, 15 — each step adds the next row size.",
    visualization: "abstract_pattern",
    vizData: {
      ...abstractViz("sequence", cells),
      optionShapes: optionShapes.map(encodeCell),
    },
    hints: hintLines(
      "Count dots in each figure: 1, 3, 6, 10 — these are triangular numbers.",
      "Each new row has one more dot than the previous row added (+1, +2, +3, +4, …).",
      "After 10 dots, add a row of 5 → $10 + 5 = 15$ dots total.",
    ),
  };
}

function genShapeRotation(rng: () => number, id: number): QuestionDraft {
  const step = pickFrom(rng, [90, 180] as const);
  const rotations = [0, step, step * 2, step * 3];
  const cells: AbstractCell[] = rotations.map((rotation) => ({
    shape: "square",
    filled: false,
    rotation,
  }));
  const correctCell: AbstractCell = { shape: "square", filled: false, rotation: step * 4 };
  const wrongCells: AbstractCell[] = [
    { shape: "square", filled: false, rotation: step * 3 },
    { shape: "square", filled: true, rotation: step * 4 },
    { shape: "triangle", filled: false, rotation: step * 4 },
  ];
  const { options, correctIndex, optionShapes } = buildShapeOptions(rng, correctCell, wrongCells);

  return {
    id,
    topic: "abstract_reasoning",
    prompt: `Each figure rotates ${step}° clockwise. Choose the next figure.`,
    options,
    correctIndex,
    explanation: `The square turns ${step}° each step; after ${rotations[3]}° comes ${step * 4}°.`,
    visualization: "abstract_pattern",
    vizData: {
      ...abstractViz("sequence", cells),
      optionShapes: optionShapes.map(encodeCell),
    },
    hints: hintLines(
      `Track the square's rotation: ${rotations.join("° → ")}° across the four shown figures.`,
      step === 90
        ? "Each step adds 90° clockwise — a quarter turn."
        : "Each step adds 180° — the square flips to the opposite orientation.",
      `The fifth figure should be rotated ${step * 4}° from the first (same hollow square, not a triangle).`,
    ),
  };
}

function genMatrixPattern(rng: () => number, id: number): QuestionDraft {
  const shapes: AbstractShape[] = ["circle", "square", "triangle"];
  const rows = 3;
  const cols = 3;
  const cells: AbstractCell[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (r === 2 && c === 2) {
        cells.push({ shape: "circle", filled: false, rotation: 0, dots: -1 });
      } else {
        cells.push({
          shape: shapes[c]!,
          filled: r % 2 === 0,
          rotation: 0,
        });
      }
    }
  }
  const correctCell: AbstractCell = { shape: shapes[2]!, filled: true, rotation: 0 };
  const wrongCells: AbstractCell[] = [
    { shape: shapes[1]!, filled: true, rotation: 0 },
    { shape: shapes[2]!, filled: false, rotation: 0 },
    { shape: shapes[0]!, filled: true, rotation: 0 },
  ];
  const { options, correctIndex, optionShapes } = buildShapeOptions(rng, correctCell, wrongCells);

  return {
    id,
    topic: "abstract_reasoning",
    prompt: "Each row uses the same three shapes in order. Each row alternates filled and hollow. Find the missing cell.",
    options,
    correctIndex,
    explanation: "Row 3 follows circle → square → triangle; even rows use filled shapes.",
    visualization: "abstract_pattern",
    vizData: {
      ...abstractViz("matrix", cells, cols),
      optionShapes: optionShapes.map(encodeCell),
    },
    hints: hintLines(
      "Read each row left to right: shapes cycle circle → square → triangle.",
      "Row 1 uses filled shapes, row 2 hollow, row 3 filled again (alternating by row).",
      "The missing cell is row 3, column 3 → a filled triangle.",
    ),
  };
}

function genSizeProgression(rng: () => number, id: number): QuestionDraft {
  const counts = [1, 2, 3, 4];
  const next = 5;
  const cells: AbstractCell[] = counts.map((n) => ({
    shape: "square",
    filled: true,
    rotation: 0,
    dots: n,
  }));
  const correctCell: AbstractCell = { shape: "square", filled: true, rotation: 0, dots: next };
  const wrongCells: AbstractCell[] = [
    { shape: "square", filled: true, rotation: 0, dots: 4 },
    { shape: "square", filled: true, rotation: 0, dots: 6 },
    { shape: "square", filled: true, rotation: 0, dots: 7 },
  ];
  const { options, correctIndex, optionShapes } = buildShapeOptions(rng, correctCell, wrongCells);

  return {
    id,
    topic: "abstract_reasoning",
    prompt: "How many dots appear in the next figure?",
    options,
    correctIndex,
    explanation: `The count increases by 1 each step: ${counts.join(", ")}, ${next}.`,
    visualization: "abstract_pattern",
    vizData: {
      ...abstractViz("sequence", cells),
      optionShapes: optionShapes.map(encodeCell),
    },
    hints: hintLines(
      `Count dots in order: ${counts.join(", ")} — the total increases by 1 each figure.`,
      "This is a simple arithmetic sequence of dot counts.",
      `After 4 dots comes ${next} dots; match that count to choices A–D.`,
    ),
  };
}

function genSymbolEquation(rng: () => number, id: number): QuestionDraft {
  const a = pickInt(rng, 3, 8);
  const b = pickInt(rng, 2, 6);
  const correct = String(a + b);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(a * b),
    String(a - b),
    String(a + b + 2),
  ]);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `If $\\triangle = ${a}$ and $\\bigcirc = ${b}$, find $\\triangle + \\bigcirc$.`,
    options,
    correctIndex,
    explanation: `$\\triangle + \\bigcirc = ${a} + ${b} = ${correct}$.`,
    visualization: "none",
    hints: hintLines(
      `Replace $\\triangle$ with ${a} and $\\bigcirc$ with ${b}.`,
      `The $+$ sign means add — not multiply (${a} $\\times$ ${b}) or subtract (${a} $-$ ${b}).`,
      "Compute the sum and match it to one of the four options.",
    ),
  };
}

function genSymbolEquationAdvanced(rng: () => number, id: number): QuestionDraft {
  const kind = pickFrom(rng, ["expression", "solve", "system"] as const);

  if (kind === "expression") {
    const form = pickFrom(rng, ["product_minus", "sum_times", "product_plus"] as const);
    const a = pickInt(rng, 4, 9);
    const b = pickInt(rng, 2, 7);
    const c = pickInt(rng, 2, 6);
    let prompt: string;
    let value: number;
    let itemHints: string[];

    if (form === "product_minus") {
      value = a * b - c;
      prompt = `If $\\triangle = ${a}$, $\\bigcirc = ${b}$, and $\\square = ${c}$, find $\\triangle \\times \\bigcirc - \\square$.`;
      itemHints = hintLines(
        "Substitute each symbol, then follow order of operations: multiply before subtracting.",
        `$\\triangle \\times \\bigcirc = ${a} \\times ${b} = ${a * b}$; then subtract $\\square = ${c}$.`,
        "Do not add the three values — multiplication and subtraction are required.",
      );
    } else if (form === "sum_times") {
      value = (a + b) * c;
      prompt = `If $\\triangle = ${a}$, $\\bigcirc = ${b}$, and $\\square = ${c}$, find $(\\triangle + \\bigcirc) \\times \\square$.`;
      itemHints = hintLines(
        "Parentheses first: compute $\\triangle + \\bigcirc$ before multiplying by $\\square$.",
        `$\\triangle + \\bigcirc = ${a} + ${b} = ${a + b}$; then multiply by $\\square = ${c}$.`,
        "Adding all three values or multiplying all three gives a different result.",
      );
    } else {
      value = a * b + c;
      prompt = `If $\\triangle = ${a}$, $\\bigcirc = ${b}$, and $\\square = ${c}$, find $\\triangle \\times \\bigcirc + \\square$.`;
      itemHints = hintLines(
        "Multiply $\\triangle$ and $\\bigcirc$ first, then add $\\square$.",
        `$\\triangle \\times \\bigcirc = ${a} \\times ${b} = ${a * b}$; then add $\\square = ${c}$.`,
        "Do not subtract — the expression ends with $+ \\square$.",
      );
    }

    const correct = String(value);
    const { options, correctIndex } = buildOptions(rng, correct, [
      String(a + b + c),
      String(a * b * c),
      String(Math.abs(a * b - c) + pickInt(rng, 1, 3)),
    ]);
    return {
      id,
      topic: "abstract_reasoning",
      prompt,
      options,
      correctIndex,
      explanation: `Substitute and evaluate: ${correct}.`,
      visualization: "none",
      hints: itemHints,
    };
  }

  if (kind === "solve") {
    const circle = pickInt(rng, 4, 12);
    const triangle = pickInt(rng, 3, 14);
    const sum = triangle + circle;
    const correct = String(triangle);
    const { options, correctIndex } = buildOptions(rng, correct, [
      String(circle),
      String(sum),
      String(Math.abs(triangle - circle)),
    ]);
    return {
      id,
      topic: "abstract_reasoning",
      prompt: `If $\\triangle + \\bigcirc = ${sum}$ and $\\bigcirc = ${circle}$, find $\\triangle$.`,
      options,
      correctIndex,
      explanation: `$\\triangle = ${sum} - ${circle} = ${triangle}$.`,
      visualization: "none",
      hints: hintLines(
        `Treat this like a one-variable equation: $\\triangle + \\bigcirc = ${sum}$.`,
        `Replace $\\bigcirc$ with ${circle}: $\\triangle + ${circle} = ${sum}$.`,
        "Isolate $\\triangle$ by subtracting the known value from both sides.",
      ),
    };
  }

  const circle = pickInt(rng, 2, 8);
  const triangle = pickInt(rng, 5, 14);
  const sum = triangle + circle;
  const diff = triangle - circle;
  const askTriangle = rng() < 0.5;
  const correct = String(askTriangle ? triangle : circle);
  const symbol = askTriangle ? "\\triangle" : "\\bigcirc";
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(askTriangle ? circle : triangle),
    String(sum),
    String(diff),
  ]);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `If $\\triangle + \\bigcirc = ${sum}$ and $\\triangle - \\bigcirc = ${diff}$, find $${symbol}$.`,
    options,
    correctIndex,
    explanation: askTriangle
      ? `$\\triangle = \\dfrac{(${sum}) + (${diff})}{2} = ${triangle}$.`
      : `$\\bigcirc = \\dfrac{(${sum}) - (${diff})}{2} = ${circle}$.`,
    visualization: "none",
    hints: hintLines(
      "You have two equations in two unknowns — combine them like a linear system.",
      askTriangle
        ? `Add the equations: $2\\triangle = ${sum} + ${diff}$.`
        : `Subtract the second from the first: $2\\bigcirc = ${sum} - ${diff}$.`,
      askTriangle
        ? "Divide by 2 to solve for $\\triangle$."
        : "Divide by 2 to solve for $\\bigcirc$.",
    ),
  };
}

function genFigureAnalogy(rng: () => number, id: number): QuestionDraft {
  const pairs = [
    {
      a: "Chapter",
      b: "Book",
      c: "Scene",
      answer: "Play",
      wrong: ["Actor", "Stage", "Script"],
      hints: hintLines(
        "A chapter is a section inside a book — what whole work contains a scene?",
        "Actor performs in a play; stage is where it happens; script is the text.",
        "Scene : play matches chapter : book (part to whole).",
      ),
    },
    {
      a: "Petals",
      b: "Flower",
      c: "Pages",
      answer: "Book",
      wrong: ["Shelf", "Ink", "Library"],
      hints: hintLines(
        "Petals are parts of a flower — pages are parts of what object?",
        "Shelf and library hold books; ink is used to print them.",
        "Pages belong to a book, just as petals belong to a flower.",
      ),
    },
    {
      a: "Key",
      b: "Lock",
      c: "Password",
      answer: "Account",
      wrong: ["Keyboard", "Screen", "Email"],
      hints: hintLines(
        "A key opens a lock — a password unlocks or secures what?",
        "Keyboard and screen are devices; email is a message type.",
        "Password protects an account, matching key to lock.",
      ),
    },
  ];
  const item = pickFrom(rng, pairs);
  const { options, correctIndex } = buildOptions(rng, item.answer, item.wrong);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `${item.a} : ${item.b} :: ${item.c} : ?`,
    options,
    correctIndex,
    explanation: `${item.a} is a part of ${item.b}; ${item.c} is a part of ${item.answer}.`,
    visualization: "none",
    hints: item.hints,
  };
}

function genAlternatingPattern(rng: () => number, id: number): QuestionDraft {
  const start = pickInt(rng, 5, 15);
  const seq = [start, start + 2, start + 4, start + 1, start + 3];
  const next = start + 5;
  const correct = String(next);
  const { options, correctIndex } = buildOptions(rng, correct, [
    String(start + 4),
    String(start + 6),
    String(start + 2),
  ]);
  return {
    id,
    topic: "abstract_reasoning",
    prompt: `Two interleaved patterns: ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: `Odd positions +2 each time; even positions +2 each time — next is ${next}.`,
    visualization: "none",
    hints: hintLines(
      `Split the sequence into odd positions (${start}, ${start + 4}, …) and even positions (${start + 2}, ${start + 1}, …).`,
      `Odd-position terms: ${start}, ${start + 4} — each adds 4. Even-position terms: ${start + 2}, ${start + 1} — check their rule (+2 each among evens).`,
      `Position 6 is even; continuing the even sub-sequence ${start + 1}, ${start + 3} gives ${next}.`,
    ),
  };
}

export const abstractStandardGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "abstract_reasoning", fn: genLetterSkipSequence },
  { topic: "abstract_reasoning", fn: genVerbalAnalogy },
  { topic: "abstract_reasoning", fn: genOddOneOut },
  { topic: "abstract_reasoning", fn: genNumberPattern },
  { topic: "abstract_reasoning", fn: genTriangularDots },
  { topic: "abstract_reasoning", fn: genSymbolEquation },
  { topic: "abstract_reasoning", fn: genSizeProgression },
];

export const abstractAdvancedGenerators: { topic: Topic; fn: Generator }[] = [
  { topic: "abstract_reasoning", fn: genShapeRotation },
  { topic: "abstract_reasoning", fn: genMatrixPattern },
  { topic: "abstract_reasoning", fn: genSymbolEquationAdvanced },
  { topic: "abstract_reasoning", fn: genFigureAnalogy },
  { topic: "abstract_reasoning", fn: genAlternatingPattern },
  { topic: "abstract_reasoning", fn: genNumberPattern },
  { topic: "abstract_reasoning", fn: genOddOneOut },
];
