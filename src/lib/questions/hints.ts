import type { Question } from "../types";

type QuestionDraft = Omit<Question, "hints"> & { hints?: string[] };

function hints(...items: string[]): string[] {
  return items.slice(0, 3);
}

export function attachHints(q: QuestionDraft): Question {
  const provided = q.hints?.filter(Boolean).slice(0, 3) ?? [];
  const h = provided.length > 0 ? provided : getHints(q);
  const { hints: _drop, ...rest } = q;
  return {
    ...rest,
    hints:
      h.length > 0
        ? h
        : hints(
            "Re-read the question and identify what is being asked.",
            "Write down the relevant formula or rule.",
            "Check your arithmetic before choosing an answer.",
          ),
  };
}

function getHints(q: QuestionDraft): string[] {
  const { prompt, visualization, vizData, topic } = q;

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

  if (prompt.startsWith("Solve the system:") || prompt.startsWith("Solve:\\")) {
    return hints(
      "Use elimination or substitution to reduce to one variable.",
      "The graph shows both lines — the answer is their intersection point.",
      "Verify your $(x, y)$ pair satisfies both equations.",
    );
  }

  if (prompt.startsWith("Solve: $") && prompt.includes(" > 0")) {
    return hints(
      "Find the roots by factoring or the quadratic formula.",
      "Sketch the parabola — it opens upward if $x^2$ has a positive coefficient.",
      "A product $> 0$ means both factors share the same sign — outside the roots.",
    );
  }

  if (prompt.startsWith("Describe the roots of")) {
    return hints(
      "Compute the discriminant: $\\Delta = b^2 - 4ac$.",
      "$\\Delta > 0$: two real roots; $\\Delta = 0$: one repeated root; $\\Delta < 0$: no real roots.",
      "You can also factor or graph the parabola to count $x$-intercepts.",
    );
  }

  if (prompt.startsWith("Use the quadratic formula on")) {
    return hints(
      "Identify $a$, $b$, and $c$ from the standard form $ax^2 + bx + c = 0$.",
      "Substitute into $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
      "Simplify both roots; order does not matter.",
    );
  }

  if (prompt.startsWith("Factor: $") && prompt.includes("x^2 - 9")) {
    return hints(
      "This is a difference of squares: $(\\text{?})^2 - 3^2$.",
      "Factor as $(ax - 3)(ax + 3)$ where $a^2$ is the coefficient of $x^2$.",
      "Check by expanding — middle terms should cancel.",
    );
  }

  if (prompt.startsWith("Simplify: $") && prompt.includes("\\cdot") && prompt.includes("^{")) {
    return hints(
      "Same base — add the exponents: $a^m \\cdot a^n = a^{m+n}$.",
      "Keep the base unchanged; only the exponent changes.",
      "Do not multiply the base by the exponents.",
    );
  }

  if (prompt.includes("Test scores:") && prompt.includes("weight")) {
    return hints(
      "Weighted mean: $\\bar{x}_w = \\dfrac{\\sum w_i x_i}{\\sum w_i}$.",
      "Multiply each score by its weight, add those products.",
      "Divide by the total of all weights (not the number of scores).",
    );
  }

  if (prompt.startsWith("Data: value $")) {
    return hints(
      "Each value appears as many times as its frequency.",
      "Sum: $(\\text{value}_1 \\times f_1) + (\\text{value}_2 \\times f_2) + \\cdots$.",
      "Divide by total frequency $\\sum f_i$ to get the mean.",
    );
  }

  if (prompt.includes("population standard deviation")) {
    return hints(
      "Find the mean $\\bar{x}$ first.",
      "For each value: square its deviation $(x - \\bar{x})^2$, weighted by frequency.",
      "Population SD: $\\sigma = \\sqrt{\\dfrac{\\sum (x - \\bar{x})^2}{N}}$; round to nearest tenth.",
    );
  }

  if (prompt.startsWith("Find the range of:")) {
    return hints(
      "Range = largest value minus smallest value.",
      "Scan every number in the data set.",
      "Subtract min from max — not mean or median.",
    );
  }

  if (prompt.includes("committee of") && prompt.includes("chosen from")) {
    return hints(
      "Order does not matter — use combinations.",
      "Formula: $\\binom{n}{r} = \\dfrac{n!}{r!(n-r)!}$.",
      "For $r = 4$, compute $\\dfrac{n \\cdot (n-1) \\cdot (n-2) \\cdot (n-3)}{4!}$.",
    );
  }

  if (prompt.includes("ordered") && prompt.includes("codes") && prompt.includes("without repetition")) {
    return hints(
      "Order matters — use permutations.",
      "Each digit chosen reduces the pool: $n \\times (n-1) \\times (n-2)$ for 3 digits.",
      "Formula: $P(n, 3) = n(n-1)(n-2)$.",
    );
  }

  if (prompt.includes("independent with") && prompt.includes("P(A \\cap B)")) {
    return hints(
      "Independent events: $P(A \\cap B) = P(A) \\times P(B)$.",
      "Multiply the two given probabilities.",
      "Simplify the product fraction if possible.",
    );
  }

  if (prompt.includes("sports player") && prompt.includes("honor student")) {
    return hints(
      "This is conditional probability: $P(\\text{honor} \\mid \\text{sports})$.",
      "Restrict the sample space to sports players only.",
      "Divide honor-and-sports count by total sports players.",
    );
  }

  if (prompt.includes("without replacement") && prompt.includes("both red")) {
    return hints(
      "First draw: $P(\\text{red}_1) = \\dfrac{\\text{red}}{\\text{total}}$.",
      "Second draw (no replacement): $P(\\text{red}_2) = \\dfrac{\\text{red}-1}{\\text{total}-1}$.",
      "Multiply the two probabilities.",
    );
  }

  if (prompt.includes("g(x)=x^2") && prompt.includes("find $f(g(")) {
    return hints(
      "Evaluate the inner function first: compute $g(x)$.",
      "Substitute that result into $f$.",
      "Follow order of operations — square before multiplying by the slope.",
    );
  }

  if (prompt.includes("find $x$ such that $f(x)")) {
    return hints(
      "Set the linear expression equal to the given output value.",
      "Isolate $x$: undo addition/subtraction, then divide by the coefficient.",
      "Check by substituting your answer back into $f(x)$.",
    );
  }

  if (prompt.includes("sum of the first") && prompt.includes("arithmetic sequence")) {
    return hints(
      "Sum formula: $S_n = \\dfrac{n}{2}(2a_1 + (n-1)d)$.",
      "Substitute $a_1$, $d$, and $n$ from the problem.",
      "You are summing $n$ terms, not finding the $n$th term alone.",
    );
  }

  if (prompt.includes("Find the sum $S_") && prompt.includes("geometric series")) {
    return hints(
      "Geometric series sum: $S_n = a_1 \\dfrac{r^n - 1}{r - 1}$ when $r \\neq 1$.",
      "Identify $a_1$, common ratio $r$, and number of terms $n$.",
      "Substitute carefully — compute $r^n$ before subtracting 1.",
    );
  }

  if (prompt.includes("population doubles") || (prompt.includes("multiplies by") && prompt.includes("periods"))) {
    return hints(
      "Exponential growth: multiply by the factor each period.",
      "After $t$ periods: $P = P_0 \\cdot r^t$.",
      "Do not add the periods — use repeated multiplication.",
    );
  }

  if (prompt.startsWith("Find the distance between")) {
    return hints(
      "Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.",
      "Subtract coordinates, square each difference, add, then take the square root.",
      "Order of subtraction does not matter because of squaring.",
    );
  }

  if (prompt.startsWith("Find the midpoint of")) {
    return hints(
      "Midpoint: $\\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$.",
      "Average the $x$-coordinates and average the $y$-coordinates separately.",
      "Do not add all four numbers and divide by 4.",
    );
  }

  if (prompt.includes("linear scale factor") && prompt.includes("area")) {
    return hints(
      "Areas of similar figures scale by the square of the linear factor.",
      "If scale factor is $k$, area scales by $k^2$.",
      "Multiply the smaller area by $k^2$, not by $k$.",
    );
  }

  if (prompt.startsWith("From ") && prompt.includes("angle of elevation")) {
    return hints(
      "Draw a right triangle: distance is adjacent, height is opposite.",
      "Use $\\tan(\\theta) = \\dfrac{\\text{opposite}}{\\text{adjacent}}$.",
      "Use exact values for special angles ($30°$, $45°$, $60°$).",
    );
  }

  if (prompt.startsWith("The parabola") && prompt.includes("maximum value")) {
    return hints(
      "A downward-opening parabola has a maximum at its vertex.",
      "Vertex form $y = -(x - h)^2 + k$ has maximum $y = k$.",
      "The maximum is the $y$-coordinate of the vertex, not the $x$-coordinate.",
    );
  }

  if (prompt.startsWith("Classify the function:")) {
    return hints(
      "Linear: $mx + b$. Exponential: $a \\cdot b^x$. Rational: ratio of polynomials.",
      "Check where the variable appears — exponent, denominator, or power 1.",
      "Match the form in the question to the function family name.",
    );
  }

  if (prompt.includes("Find the domain of $f(x)")) {
    return hints(
      "Domain excludes values that make the denominator zero.",
      "Set the denominator equal to zero and solve.",
      "Express the domain with $x \\neq \\text{excluded value(s)}$.",
    );
  }

  if (prompt.includes("horizontal asymptote of $f(x)")) {
    return hints(
      "Compare degrees of numerator and denominator polynomials.",
      "If degrees are equal, asymptote is $y = \\dfrac{\\text{leading num}}{\\text{leading den}}$.",
      "If numerator degree is lower, asymptote is $y = 0$.",
    );
  }

  if (prompt.includes("If $f(x) =") && prompt.includes("\\cdot") && prompt.includes("^x")) {
    return hints(
      "Substitute the given $x$-value into $a \\cdot b^x$.",
      "Evaluate the exponent first: compute $b^x$.",
      "Then multiply by the coefficient $a$.",
    );
  }

  if (prompt.includes("halves every hour") || prompt.includes("(\\tfrac{1}{2})^t")) {
    return hints(
      "Exponential decay: multiply by $\\tfrac{1}{2}$ each period.",
      "After $t$ periods: $A = A_0 \\cdot (\\tfrac{1}{2})^t$.",
      "Do not subtract — use repeated halving.",
    );
  }

  if (prompt.includes("Vieta") || prompt.includes("sum of the roots") || prompt.includes("product of the roots")) {
    return hints(
      "For $x^2 + bx + c = 0$: sum of roots $= -b$, product $= c$.",
      "Vieta's formulas work without solving for each root individually.",
      "For $r_1^2 + r_2^2$, use $(r_1 + r_2)^2 - 2r_1 r_2$.",
    );
  }

  if (prompt.includes("For $x^2") && prompt.includes("find the sum of the roots")) {
    return hints(
      "Vieta: sum of roots $= -\\dfrac{b}{a}$; here $a = 1$, so sum $= -b$.",
      "Read the middle coefficient carefully, including its sign.",
      "No need to factor or use the quadratic formula.",
    );
  }

  if (prompt.includes("For $x^2") && prompt.includes("product of the roots")) {
    return hints(
      "Vieta: product of roots $= \\dfrac{c}{a}$; here $a = 1$, so product $= c$.",
      "The constant term is the product of the two roots.",
      "Sign: if $c > 0$, roots share the same sign.",
    );
  }

  if (prompt.includes("r_1^2 + r_2^2")) {
    return hints(
      "Use $(r_1 + r_2)^2 - 2r_1 r_2$.",
      "Substitute the given sum and product of roots.",
      "Expand $(\\text{sum})^2$ before subtracting $2 \\times \\text{product}$.",
    );
  }

  if (prompt.includes("\\dfrac{1}{r_1} + \\dfrac{1}{r_2}")) {
    return hints(
      "Combine: $\\dfrac{1}{r_1} + \\dfrac{1}{r_2} = \\dfrac{r_1 + r_2}{r_1 r_2}$.",
      "Numerator is sum of roots; denominator is product of roots.",
      "Apply Vieta's values directly.",
    );
  }

  if (prompt.includes("Solve: $|")) {
    return hints(
      "Rewrite as $-c \\leq \\text{expression} \\leq c$.",
      "Isolate $x$ in the middle — apply the same steps to all three parts.",
      "Watch for sign changes when multiplying or dividing by a negative.",
    );
  }

  if (prompt.includes("Solve: $") && prompt.includes(" \\leq ") && prompt.includes("x \\leq ")) {
    return hints(
      "Compound inequality — isolate $x$ in the center.",
      "Apply the same operation to all three parts.",
      "Express the final answer as a closed interval $[a, b]$.",
    );
  }

  if (prompt.includes("Solve: $(x -") && prompt.includes(") > 0")) {
    return hints(
      "Roots are the values that make each factor zero.",
      "Test intervals between roots; leading term positive means $> 0$ outside the roots.",
      "Answer as $x < r_1$ or $x > r_2$, not between the roots.",
    );
  }

  if (prompt.startsWith("Find the circumference of")) {
    return hints(
      "Circumference: $C = 2\\pi r$.",
      "Do not use $\\pi r^2$ — that is area.",
      "Substitute the radius and leave $\\pi$ in the answer.",
    );
  }

  if (prompt.includes("central angle") && prompt.includes("arc length")) {
    return hints(
      "Arc length: $s = \\dfrac{\\theta}{360°} \\times 2\\pi r$.",
      "Use the given angle and radius in degrees.",
      "Simplify the fraction before multiplying.",
    );
  }

  if (prompt.includes("sector") && prompt.includes("central angle")) {
    return hints(
      "Sector area: $A = \\dfrac{\\theta}{360°} \\pi r^2$.",
      "Find full circle area $\\pi r^2$ first, then take the fraction $\\theta / 360$.",
      "Do not confuse with arc length.",
    );
  }

  if (prompt.includes("Identify the center of the circle")) {
    return hints(
      "Standard form: $(x - h)^2 + (y - k)^2 = r^2$.",
      "Compare signs: $(x - h)$ means center $x$-coordinate is $h$.",
      "Center is $(h, k)$, not $(r, h)$.",
    );
  }

  if (prompt.includes("slope-intercept form")) {
    return hints(
      "Form: $y = mx + b$ — slope is the coefficient of $x$.",
      "The $y$-intercept is the constant term (value when $x = 0$).",
      "Match what the question asks: slope $m$ or intercept $b$.",
    );
  }

  if (prompt.startsWith("Write in slope-intercept form:")) {
    return hints(
      "Isolate $y$ on one side of the equation.",
      "Divide by the coefficient of $y$ if needed.",
      "Result should look like $y = mx + b$.",
    );
  }

  if (prompt.includes("point-slope equation")) {
    return hints(
      "Formula: $y - y_1 = m(x - x_1)$.",
      "Substitute the given point and slope.",
      "Do not swap $x$ and $y$ coordinates.",
    );
  }

  if (prompt.startsWith("Which description best fits $y =")) {
    return hints(
      "Standard: $ax^2 + bx + c$. Vertex: $a(x-h)^2 + k$. Factored: $a(x-r_1)(x-r_2)$.",
      "Look at how the equation is written — expanded, completed square, or factored.",
      "Point-slope and slope-intercept apply to lines, not quadratics.",
    );
  }

  if (prompt.includes("scale factor") && prompt.includes("corresponding side")) {
    return hints(
      "Corresponding sides in similar triangles are proportional.",
      "Going from smaller to larger: multiply by the scale factor.",
      "Going from larger to smaller: divide by the scale factor.",
    );
  }

  if (prompt.includes("similar (AA)")) {
    return hints(
      "AA similarity means all corresponding sides share the same scale factor.",
      "Multiply the known side by the scale factor given.",
      "Angles matching confirms similarity — sides scale uniformly.",
    );
  }

  if (prompt.includes("If $f(x) =") && prompt.includes("\\dfrac")) {
    return hints(
      "Substitute the given $x$-value into numerator and denominator separately.",
      "Evaluate each part, then divide.",
      "Check that the denominator is not zero at that $x$-value.",
    );
  }

  if (prompt.startsWith("Simplify:") && prompt.includes("\\tan^2\\theta")) {
    return hints(
      "This is a Pythagorean identity related to $\\sin^2\\theta + \\cos^2\\theta = 1$.",
      "Divide the main identity by $\\cos^2\\theta$ to get $1 + \\tan^2\\theta = \\sec^2\\theta$.",
      "The simplified form is $\\sec^2\\theta$.",
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

  if (prompt.includes("\\cos\\theta") || prompt.includes("\\sin\\theta")) {
    if (!prompt.startsWith("Simplify:")) {
      return hints(
        "Label the triangle: opposite, adjacent, and hypotenuse relative to $\\theta$.",
        "SOH-CAH-TOA: $\\sin = \\dfrac{\\text{opp}}{\\text{hyp}}$, $\\cos = \\dfrac{\\text{adj}}{\\text{hyp}}$.",
        "Use the given ratio to find the missing side.",
      );
    }
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

  if (prompt.startsWith("Simplify: $") && prompt.includes("^{") && !prompt.includes("\\cdot")) {
    return hints(
      "Repeated multiplication: $a^n$ means $a$ multiplied $n$ times.",
      "Compute step by step rather than adding the exponent to the base.",
      "Write out the factors if needed: e.g. $2^3 = 2 \\times 2 \\times 2$.",
    );
  }

  if (prompt.startsWith("Solve: $") && prompt.includes("\\leq") && !prompt.includes("x \\leq ")) {
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

  if (prompt.includes("marbles") && prompt.includes("P(red)")) {
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

  if (prompt.includes("arithmetic sequence") && !prompt.includes("sum of the first")) {
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

  if (visualization === "bar_chart" && vizData?.segments) {
    return hints(
      "The bar is split into parts matching the ratio.",
      "Each segment size corresponds to one part of the ratio.",
      "Scale each part up to the total given in the problem.",
    );
  }

  if (visualization === "abstract_pattern") {
    return hints(
      "Look for a repeating rule: rotation, count, shape order, or fill pattern.",
      "Compare each figure to the previous one — what changed?",
      "Match your chosen rule to the labeled answer shapes A–D.",
    );
  }

  // Topic-based fallbacks (specific to subject, not fully generic)
  if (topic === "statistics") {
    return hints(
      "Identify whether the problem asks for mean, probability, counting, or spread.",
      "Write the relevant formula before substituting numbers.",
      "Check whether order matters (permutation vs combination).",
    );
  }

  if (topic === "functions") {
    return hints(
      "Identify the function type: linear, exponential, rational, or composition.",
      "Substitute carefully and follow order of operations.",
      "For inverses or composition, work inside-out.",
    );
  }

  if (topic === "algebra") {
    return hints(
      "Isolate the variable or apply the named theorem (Vieta, quadratic formula, etc.).",
      "Watch signs when moving terms across the equals sign.",
      "Verify by substituting your answer back.",
    );
  }

  if (topic === "geometry") {
    return hints(
      "Match the problem to a geometry formula (distance, area, similarity, circle).",
      "Draw or use the diagram to label known and unknown values.",
      "Similar figures scale lengths by $k$ and areas by $k^2$.",
    );
  }

  if (topic === "trigonometry") {
    return hints(
      "Label opposite, adjacent, and hypotenuse relative to the given angle.",
      "Pick the correct ratio: SOH-CAH-TOA or a Pythagorean identity.",
      "Use exact values for special angles when requested.",
    );
  }

  if (topic === "number_sense") {
    return hints(
      "Identify the operation: fraction arithmetic, percent, ratio, or order of operations.",
      "Convert to a common form (decimals or fractions) if helpful.",
      "Double-check arithmetic before selecting an answer.",
    );
  }

  if (topic === "abstract_reasoning") {
    return hints(
      "Look for a repeating pattern, analogy relationship, or category rule.",
      "State the rule in words before extending it.",
      "Eliminate choices that break the pattern after one step.",
    );
  }

  return [];
}

