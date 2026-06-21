import type { Question } from "../types";

type QuestionDraft = Omit<Question, "hints">;

function hints(...items: string[]): string[] {
  return items.slice(0, 3);
}

export function attachHints(q: QuestionDraft): Question {
  const h = getHints(q);
  return { ...q, hints: h.length > 0 ? h : hints("Re-read the question and identify what is being asked.", "Write down the relevant formula or rule.", "Check your arithmetic before choosing an answer.") };
}

function getHints(q: QuestionDraft): string[] {
  const { prompt, visualization, vizData } = q;

  if (prompt.startsWith("Evaluate: $\\dfrac")) {
    return hints(
      "Find the least common denominator of the two fractions.",
      "Rewrite each fraction with that denominator, then add the numerators.",
      "Simplify the result if the numerator and denominator share a common factor.",
    );
  }

  if (prompt.startsWith("What is ") && prompt.includes("\\% of")) {
    return hints(
      "Convert the percent to a decimal or fraction (divide by 100).",
      "Multiply that value by the given number.",
      "The result is the part of the whole.",
    );
  }

  if (prompt.includes("ratio $") && prompt.includes("students")) {
    return hints(
      "Add the ratio parts to get the total number of parts.",
      "The boys' share is $\\dfrac{\\text{boys' part}}{\\text{total parts}}$ of the whole class.",
      "Multiply that fraction by the total number of students.",
    );
  }

  if (prompt.startsWith("Compute: $") && prompt.includes("\\times")) {
    return hints(
      "Line up the decimal places mentally or on paper.",
      "Multiply as with whole numbers, then place the decimal point.",
      "Count decimal digits in the factors to set the decimal in the product.",
    );
  }

  if (prompt.includes("order of operations")) {
    return hints(
      "PEMDAS: multiply and divide before add and subtract.",
      "Compute the multiplication first.",
      "Then apply the subtraction.",
    );
  }

  if (prompt.startsWith("Solve for $x$:")) {
    return hints(
      "Isolate the term with $x$ by undoing addition or subtraction.",
      "Divide both sides by the coefficient of $x$.",
      "Verify by substituting your answer back into the equation.",
    );
  }

  if (prompt.startsWith("Find the roots of")) {
    return hints(
      "Set $y = 0$ and solve for $x$, or factor the quadratic.",
      "Look for two numbers that multiply to the constant term and add to the middle coefficient.",
      "Each factor $(x - r) = 0$ gives a root $x = r$.",
    );
  }

  if (prompt.startsWith("Factor completely:")) {
    return hints(
      "This is a quadratic in the form $x^2 + bx + c$.",
      "Find two numbers that multiply to $c$ and add to $b$.",
      "Write as $(x + \\text{?})(x + \\text{?})$.",
    );
  }

  if (prompt.startsWith("Solve the system:")) {
    return hints(
      "Try substitution or elimination to reduce to one variable.",
      "The graph shows where the two lines intersect.",
      "Verify your $(x, y)$ pair in both original equations.",
    );
  }

  if (prompt.startsWith("Simplify: $") && prompt.includes("^{")) {
    return hints(
      "Repeated multiplication: $a^n$ means $a$ multiplied $n$ times.",
      "Compute step by step rather than adding the exponent to the base.",
      "Write out the factors if needed: e.g. $2^3 = 2 \\times 2 \\times 2$.",
    );
  }

  if (prompt.startsWith("Solve: $") && prompt.includes("\\leq")) {
    return hints(
      "Treat it like an equation: divide both sides by the coefficient of $x$.",
      "If you divide by a positive number, the inequality direction stays the same.",
      "Express the solution as all $x$ values that satisfy the inequality.",
    );
  }

  if (prompt.includes("right triangle") && prompt.includes("missing leg")) {
    return hints(
      "Use the Pythagorean theorem: $a^2 + b^2 = c^2$.",
      "Substitute the known leg and hypotenuse; solve for the missing leg.",
      "Take the square root of the result.",
    );
  }

  if (prompt.includes("Find the hypotenuse")) {
    return hints(
      "Use $c^2 = a^2 + b^2$ where $c$ is the hypotenuse.",
      "Add the squares of the two legs.",
      "The hypotenuse is the square root of that sum.",
    );
  }

  if (prompt.includes("area of a triangle with base")) {
    return hints(
      "Area formula: $A = \\dfrac{1}{2} \\times \\text{base} \\times \\text{height}$.",
      "The height must be perpendicular to the base (see diagram).",
      "Multiply base and height first, then divide by 2.",
    );
  }

  if (prompt.includes("area of a circle")) {
    return hints(
      "Use $A = \\pi r^2$.",
      "Square the radius first, then multiply by $\\pi$.",
      "Leave $\\pi$ in your answer unless a decimal approximation is required.",
    );
  }

  if (prompt.includes("perimeter")) {
    return hints(
      "Perimeter is the total distance around the shape.",
      "For a rectangle: $P = 2l + 2w$ or $P = 2(l + w)$.",
      "Add length and width, then double the result.",
    );
  }

  if (prompt.includes("similar triangles")) {
    return hints(
      "Corresponding sides in similar figures are proportional.",
      "Multiply the known side by the scale factor.",
      "The scale factor tells how many times larger the larger triangle is.",
    );
  }

  if (prompt.includes("\\cos\\theta") || prompt.includes("\\sin\\theta")) {
    return hints(
      "Label the triangle: opposite, adjacent, and hypotenuse relative to $\\theta$.",
      "SOH-CAH-TOA: $\\sin = \\dfrac{\\text{opp}}{\\text{hyp}}$, $\\cos = \\dfrac{\\text{adj}}{\\text{hyp}}$.",
      "Use the given ratio to find the missing side.",
    );
  }

  if (prompt.startsWith("Evaluate: $") && (prompt.includes("\\sin") || prompt.includes("\\cos") || prompt.includes("\\tan"))) {
    const is45 = prompt.includes("45°");
    return hints(
      is45
        ? "Use the 45°–45°–90° reference triangle shown in the diagram."
        : "Use the 30°–60°–90° reference triangle shown in the diagram.",
      "Match the requested ratio (sin, cos, or tan) to opposite, adjacent, or hypotenuse.",
      "Exact values often involve $\\dfrac{1}{2}$, $\\dfrac{\\sqrt{2}}{2}$, or $\\dfrac{\\sqrt{3}}{2}$.",
    );
  }

  if (prompt.includes("\\sin^2\\theta + \\cos^2\\theta")) {
    return hints(
      "This is the Pythagorean identity.",
      "It holds for every angle $\\theta$.",
      "The sum simplifies to a constant.",
    );
  }

  if (prompt.includes("1 - \\sin^2\\theta")) {
    return hints(
      "Rearrange the identity $\\sin^2\\theta + \\cos^2\\theta = 1$.",
      "Subtract $\\sin^2\\theta$ from both sides.",
      "The result is a single squared trig function.",
    );
  }

  if (prompt.includes("1 - \\cos^2\\theta")) {
    return hints(
      "Start from $\\sin^2\\theta + \\cos^2\\theta = 1$.",
      "Isolate the term without $\\cos^2\\theta$.",
      "The answer is the complementary squared function.",
    );
  }

  if (prompt.includes("\\dfrac{\\sin\\theta}{\\cos\\theta}")) {
    return hints(
      "This is the definition of tangent.",
      "Divide sine by cosine.",
      "The simplified form is a single trig function of $\\theta$.",
    );
  }

  if (prompt.startsWith("Find the mean of:")) {
    return hints(
      "Mean = sum of all values divided by how many values there are.",
      "Add all the numbers in the data set.",
      "Divide the total by the count (here, 5).",
    );
  }

  if (prompt.startsWith("Find the median of:")) {
    return hints(
      "Order the data from least to greatest (already sorted here).",
      "The median is the middle value in an odd-sized list.",
      "For 5 numbers, it is the 3rd value.",
    );
  }

  if (prompt.includes("marbles")) {
    return hints(
      "Probability = $\\dfrac{\\text{favorable outcomes}}{\\text{total outcomes}}$.",
      "Count only the marbles of the requested color for the numerator.",
      "Use the total number of marbles in the bag as the denominator.",
    );
  }

  if (prompt.includes("choose") && prompt.includes("from")) {
    return hints(
      "Order does not matter — use combinations, not permutations.",
      "Formula: $\\binom{n}{r} = \\dfrac{n!}{r!(n-r)!}$.",
      "For small $r$, use $\\binom{n}{2} = \\dfrac{n(n-1)}{2}$ or $\\binom{n}{3} = \\dfrac{n(n-1)(n-2)}{6}$.",
    );
  }

  if (prompt.includes("arithmetic sequence")) {
    return hints(
      "Formula: $a_n = a_1 + (n - 1)d$.",
      "Substitute $a_1$, $d$, and the term number $n$.",
      "You are finding the $n$th term, not the sum.",
    );
  }

  if (prompt.includes("geometric sequence")) {
    return hints(
      "Formula: $a_n = a_1 \\cdot r^{\\,n-1}$.",
      "Multiply the first term by the common ratio raised to $(n - 1)$.",
      "Do not add terms — each term is multiplied by $r$.",
    );
  }

  if (prompt.startsWith("If $f(x)")) {
    return hints(
      "Replace every $x$ in the rule with the given input value.",
      "Follow order of operations after substitution.",
      "Double-check signs when multiplying and adding.",
    );
  }

  if (prompt.startsWith("Identify the vertex")) {
    return hints(
      "Vertex form: $y = (x - h)^2 + k$ has vertex $(h, k)$.",
      "Watch the signs: $(x - h)$ means $h$ is the $x$-coordinate of the vertex.",
      "The constant $k$ is the $y$-coordinate.",
    );
  }

  if (prompt.includes("thrown upward") || visualization === "matter_projectile") {
    return hints(
      "Use $h = v_0 t - \\dfrac{1}{2}gt^2$ with $g = 10\\,\\text{m/s}^2$.",
      "Substitute $v_0$ and $t$; square $t$ before multiplying by $\\dfrac{1}{2}g$.",
      "Watch the animation: upward launch under gravity.",
    );
  }

  if (visualization === "bar_chart" && vizData?.values) {
    return hints(
      "Use the bar heights as the data values.",
      "Refer to the chart when adding or ordering values.",
      "Double-check you are finding the requested measure (mean or median).",
    );
  }

  if (visualization === "bar_chart" && vizData?.segments) {
    return hints(
      "The bar is split into parts matching the ratio.",
      "Each segment size corresponds to one part of the ratio.",
      "Scale each part up to the total given in the problem.",
    );
  }

  if (visualization === "coordinate") {
    return hints(
      "Use the graph to visualize the equation or system.",
      "Key points (intercepts, vertex, intersection) often answer the question.",
      "Algebra and the graph should agree.",
    );
  }

  if (visualization === "triangle" || visualization === "circle") {
    return hints(
      "Use the diagram to identify known and unknown measures.",
      "Match the shape to the correct formula for this problem.",
      "Substitute values carefully before computing.",
    );
  }

  return [];
}
