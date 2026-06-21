"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type GraphKind = "linear" | "quadratic_roots" | "quadratic_vertex" | "system";

interface CoordinateVizProps {
  kind?: GraphKind;
  m?: number;
  b?: number;
  c?: number;
  highlightX?: number;
  vertex?: number[];
  roots?: number[];
  system?: number[];
  solution?: number[];
}

const COLORS = {
  grid: "#334155",
  axis: "#64748b",
  curve: "#3b82f6",
  curve2: "#a855f7",
  root: "#f97316",
};

type ChartRow = { x: number; y1: number | null; y2?: number | null };

function sampleRange(xMin: number, xMax: number, step = 0.2) {
  const xs: number[] = [];
  for (let x = xMin; x <= xMax; x += step) {
    xs.push(Math.round(x * 100) / 100);
  }
  return xs;
}

function inferKind(props: CoordinateVizProps): GraphKind {
  if (props.kind) return props.kind;
  if (props.system && props.system.length === 6) return "system";
  if (props.vertex) return "quadratic_vertex";
  if (props.roots && props.roots.length >= 2) return "quadratic_roots";
  return "linear";
}

export function CoordinateViz(props: CoordinateVizProps) {
  const {
    m = 1,
    b = 0,
    c = 0,
    highlightX,
    vertex,
    roots,
    system,
    solution,
  } = props;

  const kind = inferKind(props);

  const { data, line2, roots: rootPoints, highlight, xDomain, yDomain } = useMemo((): {
    data: ChartRow[];
    line2: boolean;
    roots: { x: number; y: number }[];
    highlight: { x: number; y: number } | null;
    xDomain: [number, number];
    yDomain: [number, number];
  } => {
    if (kind === "system" && system && system.length === 6) {
      const [a1, b1, c1, a2, b2, c2] = system;
      const xMin = -2;
      const xMax = 10;
      const xs = sampleRange(xMin, xMax);
      const rows = xs.map((x) => ({
        x,
        y1: b1 !== 0 ? (c1 - a1 * x) / b1 : null,
        y2: b2 !== 0 ? (c2 - a2 * x) / b2 : null,
      }));
      const sol = solution ?? [];
      const ys = rows.flatMap((r) => [r.y1, r.y2].filter((y): y is number => y !== null));
      if (sol.length === 2) ys.push(sol[1]!);
      return {
        data: rows,
        line2: true,
        roots: [],
        highlight: sol.length === 2 ? { x: sol[0]!, y: sol[1]! } : null,
        xDomain: [xMin, xMax] as [number, number],
        yDomain: [Math.min(...ys, 0) - 2, Math.max(...ys, 0) + 2] as [number, number],
      };
    }

    if (kind === "quadratic_vertex" && vertex) {
      const [h, k] = vertex;
      const xMin = h - 5;
      const xMax = h + 5;
      const rows = sampleRange(xMin, xMax).map((x) => ({
        x,
        y1: (x - h) ** 2 + k,
      }));
      const ys = rows.map((r) => r.y1);
      return {
        data: rows,
        line2: false,
        roots: [],
        highlight: { x: h, y: k },
        xDomain: [xMin, xMax] as [number, number],
        yDomain: [Math.min(...ys, k) - 2, Math.max(...ys, k) + 2] as [number, number],
      };
    }

    if (kind === "quadratic_roots" && roots && roots.length >= 2) {
      const [r1, r2] = roots;
      const bCoeff = -(r1 + r2);
      const xMin = Math.min(r1, r2) - 2;
      const xMax = Math.max(r1, r2) + 2;
      const rows = sampleRange(xMin, xMax).map((x) => ({
        x,
        y1: x ** 2 + bCoeff * x + c,
      }));
      const ys = rows.map((r) => r.y1);
      const vertexX = -bCoeff / 2;
      const vertexY = vertexX ** 2 + bCoeff * vertexX + c;
      return {
        data: rows,
        line2: false,
        roots: [
          { x: r1, y: 0 },
          { x: r2, y: 0 },
        ],
        highlight: null,
        xDomain: [xMin, xMax] as [number, number],
        yDomain: [Math.min(...ys, vertexY, 0) - 2, Math.max(...ys, 0) + 2] as [number, number],
      };
    }

    // Linear: y = mx + b
    const xMin = -6;
    const xMax = 6;
    const rows = sampleRange(xMin, xMax).map((x) => ({
      x,
      y1: m * x + b,
    }));
    const ys = rows.map((r) => r.y1);
    const hl =
      highlightX !== undefined ? { x: highlightX, y: m * highlightX + b } : null;
    if (hl) ys.push(hl.y);
    return {
      data: rows,
      line2: false,
      roots: [],
      highlight: hl,
      xDomain: [xMin, xMax] as [number, number],
      yDomain: [Math.min(...ys, 0) - 2, Math.max(...ys, 0) + 2] as [number, number],
    };
  }, [kind, m, b, c, highlightX, vertex, roots, system, solution]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={xDomain}
              allowDataOverflow
              tick={{ fill: COLORS.axis, fontSize: 11 }}
              axisLine={{ stroke: COLORS.axis }}
              tickLine={{ stroke: COLORS.axis }}
            />
            <YAxis
              type="number"
              domain={yDomain}
              allowDataOverflow
              tick={{ fill: COLORS.axis, fontSize: 11 }}
              axisLine={{ stroke: COLORS.axis }}
              tickLine={{ stroke: COLORS.axis }}
            />
            <ReferenceLine y={0} stroke={COLORS.axis} strokeWidth={1.5} />
            <ReferenceLine x={0} stroke={COLORS.axis} strokeWidth={1.5} />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [
                typeof value === "number" ? value.toFixed(2) : String(value ?? ""),
                "y",
              ]}
              labelFormatter={(x) => `x = ${x}`}
            />
            <Line
              type="linear"
              dataKey="y1"
              stroke={COLORS.curve}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              name="f(x)"
              connectNulls
            />
            {line2 && (
              <Line
                type="linear"
                dataKey="y2"
                stroke={COLORS.curve2}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                name="g(x)"
                connectNulls
              />
            )}
            {rootPoints.map((pt, i) => (
              <ReferenceDot
                key={i}
                x={pt.x}
                y={pt.y}
                r={6}
                fill={COLORS.root}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
            {highlight && (
              <ReferenceDot
                x={highlight.x}
                y={highlight.y}
                r={7}
                fill={COLORS.root}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
