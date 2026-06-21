export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function pickInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickFrom<T>(rng: () => number, items: T[]): T {
  return items[pickInt(rng, 0, items.length - 1)]!;
}

export function shuffleWithRng<T>(rng: () => number, items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = pickInt(rng, 0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function formatFraction(num: number, den: number): string {
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  if (n === 0) return "0";
  return `${n}/${d}`;
}

export function buildOptions(
  rng: () => number,
  correct: string,
  distractors: string[],
): { options: string[]; correctIndex: number } {
  const unique = new Set<string>([correct]);
  for (const d of distractors) {
    if (d !== correct) unique.add(d);
  }
  let attempt = 0;
  while (unique.size < 4 && attempt < 50) {
    const n = pickInt(rng, 1, 99);
    unique.add(String(n));
    unique.add(String(n + pickInt(rng, 1, 9)));
    attempt += 1;
  }
  const options = shuffleWithRng(rng, Array.from(unique).slice(0, 4));
  return { options, correctIndex: options.indexOf(correct) };
}
