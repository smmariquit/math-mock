"use client";

import { useEffect, useRef } from "react";
import { JXG_BOARD_OPTS, JXG_DARK, loadJXG } from "@/lib/jsxgraph/load";

export type GeometryKind =
  | "right_triangle"
  | "base_height"
  | "similar"
  | "circle"
  | "special_angle"
  | "trig";

export interface GeometryVizProps {
  kind?: GeometryKind;
  a?: number;
  b?: number;
  c?: number;
  base?: number;
  height?: number;
  scale?: number;
  side?: number;
  r?: number;
  special?: string;
}

function inferKind(props: GeometryVizProps): GeometryKind {
  if (props.kind) return props.kind;
  if (props.r !== undefined) return "circle";
  if (props.base !== undefined && props.height !== undefined) return "base_height";
  if (props.scale !== undefined && props.side !== undefined) return "similar";
  if (props.special) return "special_angle";
  return "right_triangle";
}

function labelSide(
  board: JXG.Board,
  p1: JXG.Point,
  p2: JXG.Point,
  text: string,
  offset: [number, number] = [0, 0],
) {
  const mid = board.create("midpoint", [p1, p2], { visible: false }) as JXG.Point;
  board.create(
    "text",
    [() => mid.X() + offset[0], () => mid.Y() + offset[1], () => text],
    { ...JXG_DARK.label, anchorX: "middle", anchorY: "middle" },
  );
}

function drawRightTriangle(board: JXG.Board, a: number, b: number, c: number, showTheta = false) {
  const s = 4.5 / Math.max(a, b, c);
  const A = board.create("point", [0, 0], {
    name: "A",
    size: 3,
    fixed: true,
    strokeColor: JXG_DARK.label.strokeColor,
    fillColor: JXG_DARK.accent,
  }) as JXG.Point;
  const B = board.create("point", [b * s, 0], {
    name: "B",
    size: 3,
    fixed: true,
    strokeColor: JXG_DARK.label.strokeColor,
    fillColor: JXG_DARK.accent,
  }) as JXG.Point;
  const C = board.create("point", [0, a * s], {
    name: "C",
    size: 3,
    fixed: true,
    strokeColor: JXG_DARK.label.strokeColor,
    fillColor: JXG_DARK.accent,
  }) as JXG.Point;

  board.create("polygon", [A, B, C], {
    borders: { strokeColor: JXG_DARK.stroke, strokeWidth: 2.5 },
    fillColor: JXG_DARK.fill,
    highlight: false,
  });
  board.create("angle", [B, A, C], { type: "square", strokeColor: JXG_DARK.grid, fillColor: "none" });

  labelSide(board, A, B, String(b), [0, -0.4]);
  labelSide(board, A, C, String(a), [-0.5, 0]);
  labelSide(board, B, C, String(c), [0.4, 0.25]);

  if (showTheta) {
    board.create("angle", [C, B, A], {
      radius: 0.65,
      name: "θ",
      withLabel: true,
      strokeColor: JXG_DARK.accent,
      fillColor: "rgba(251,146,60,0.25)",
      label: JXG_DARK.label,
    });
  }

  board.setBoundingBox([-1.2, a * s + 1.8, b * s + 1.8, -1.4], true);
}

function drawBaseHeight(board: JXG.Board, base: number, height: number) {
  const s = 4 / Math.max(base, height);
  const bx = base * s;
  const hy = height * s;
  const A = board.create("point", [0, 0], { visible: false, fixed: true }) as JXG.Point;
  const B = board.create("point", [bx, 0], { visible: false, fixed: true }) as JXG.Point;
  const C = board.create("point", [bx * 0.35, hy], { visible: false, fixed: true }) as JXG.Point;

  board.create("polygon", [A, B, C], {
    borders: { strokeColor: JXG_DARK.stroke, strokeWidth: 2.5 },
    fillColor: JXG_DARK.fill,
    highlight: false,
  });

  board.create("segment", [A, B], {
    strokeColor: JXG_DARK.accent,
    strokeWidth: 2.5,
    withLabel: true,
    name: `base = ${base}`,
    label: { ...JXG_DARK.label, offset: [0, -16] },
    highlight: false,
  });

  const foot = board.create("point", [bx * 0.35, 0], { visible: false, fixed: true }) as JXG.Point;
  board.create("segment", [C, foot], {
    strokeColor: JXG_DARK.purple,
    strokeWidth: 2,
    dash: 2,
    withLabel: true,
    name: `h = ${height}`,
    label: { ...JXG_DARK.label, offset: [-14, 0] },
    highlight: false,
  });
  board.create("angle", [B, foot, C], { type: "square", strokeColor: JXG_DARK.grid, fillColor: "none" });

  board.setBoundingBox([-0.6, hy + 1.2, bx + 0.8, -0.9], true);
}

function drawSimilar(board: JXG.Board, scaleFactor: number, side: number) {
  const unit = 1.1;
  const h = side * unit * 0.6;

  const smallA = board.create("point", [0, 0], { visible: false, fixed: true }) as JXG.Point;
  const smallB = board.create("point", [side * unit, 0], { visible: false, fixed: true }) as JXG.Point;
  const smallC = board.create("point", [0, h], { visible: false, fixed: true }) as JXG.Point;
  board.create("polygon", [smallA, smallB, smallC], {
    borders: { strokeColor: JXG_DARK.stroke, strokeWidth: 2.5 },
    fillColor: JXG_DARK.fill,
    highlight: false,
  });
  labelSide(board, smallA, smallB, String(side), [0, -0.35]);

  const gap = 1.6;
  const big = scaleFactor;
  const off = side * unit + gap;
  const bigA = board.create("point", [off, 0], { visible: false, fixed: true }) as JXG.Point;
  const bigB = board.create("point", [off + side * unit * big, 0], { visible: false, fixed: true }) as JXG.Point;
  const bigC = board.create("point", [off, h * big], { visible: false, fixed: true }) as JXG.Point;
  board.create("polygon", [bigA, bigB, bigC], {
    borders: { strokeColor: JXG_DARK.purple, strokeWidth: 2.5 },
    fillColor: "rgba(192,132,252,0.15)",
    highlight: false,
  });
  labelSide(board, bigA, bigB, String(side * big), [0, -0.35]);
  board.setBoundingBox([-0.5, h * big + 1.3, off + side * unit * big + 0.5, -1], true);
}

function drawCircle(board: JXG.Board, r: number) {
  const O = board.create("point", [0, 0], {
    name: "O",
    size: 3,
    fixed: true,
    strokeColor: JXG_DARK.label.strokeColor,
    fillColor: JXG_DARK.purple,
  }) as JXG.Point;
  board.create("circle", [O, r], {
    strokeColor: JXG_DARK.purple,
    strokeWidth: 2.5,
    fillColor: "rgba(192,132,252,0.12)",
    highlight: false,
  });
  const P = board.create("point", [r, 0], { visible: false, fixed: true }) as JXG.Point;
  board.create("segment", [O, P], {
    strokeColor: JXG_DARK.accent,
    strokeWidth: 2.5,
    dash: 2,
    withLabel: true,
    name: `r = ${r}`,
    label: { ...JXG_DARK.label, offset: [0, -16] },
    highlight: false,
  });
  board.setBoundingBox([-r - 1.8, r + 1.8, r + 1.8, -r - 1.8], true);
}

function drawSpecialAngle(board: JXG.Board) {
  const A = board.create("point", [0, 0], { size: 2, fixed: true, visible: false }) as JXG.Point;
  const B = board.create("point", [4, 0], { size: 2, fixed: true, visible: false }) as JXG.Point;
  const C = board.create("point", [0, (4 * Math.sqrt(3)) / 3], { size: 2, fixed: true, visible: false }) as JXG.Point;

  board.create("polygon", [A, B, C], {
    borders: { strokeColor: JXG_DARK.stroke, strokeWidth: 2.5 },
    fillColor: JXG_DARK.fill,
    highlight: false,
  });
  board.create("angle", [B, A, C], { type: "square", strokeColor: JXG_DARK.grid, fillColor: "none" });
  board.create("angle", [A, B, C], {
    radius: 0.75,
    name: "60°",
    withLabel: true,
    strokeColor: JXG_DARK.accent,
    fillColor: "rgba(251,146,60,0.2)",
    label: JXG_DARK.label,
  });
  board.create("angle", [B, C, A], {
    radius: 0.55,
    name: "30°",
    withLabel: true,
    strokeColor: JXG_DARK.purple,
    fillColor: "rgba(192,132,252,0.2)",
    label: JXG_DARK.label,
  });
  labelSide(board, A, B, "1", [0, -0.35]);
  labelSide(board, A, C, "√3", [-0.55, 0]);
  labelSide(board, B, C, "2", [0.45, 0.2]);
  board.setBoundingBox([-0.9, 3.4, 5, -0.9], true);
}

function renderGeometry(board: JXG.Board, props: GeometryVizProps) {
  const kind = inferKind(props);
  switch (kind) {
    case "circle":
      drawCircle(board, props.r ?? 5);
      break;
    case "base_height":
      drawBaseHeight(board, props.base ?? 10, props.height ?? 8);
      break;
    case "similar":
      drawSimilar(board, props.scale ?? 2, props.side ?? 4);
      break;
    case "special_angle":
      drawSpecialAngle(board);
      break;
    case "trig":
      drawRightTriangle(board, props.a ?? 3, props.b ?? 4, props.c ?? 5, true);
      break;
    default:
      drawRightTriangle(board, props.a ?? 3, props.b ?? 4, props.c ?? 5);
  }
}

export function GeometryViz(props: GeometryVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<JXG.Board | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void loadJXG()
      .then((JXG) => {
        if (cancelled || !containerRef.current) return;

        if (boardRef.current) {
          try {
            JXG.JSXGraph.freeBoard(boardRef.current);
          } catch {
            /* ignore */
          }
          boardRef.current = null;
        }

        const board = JXG.JSXGraph.initBoard(containerRef.current, {
          ...JXG_BOARD_OPTS,
          boundingbox: [-2, 8, 8, -2],
        });

        renderGeometry(board, props);
        (board as JXG.Board & { updateSize?: () => void }).updateSize?.();
        boardRef.current = board;
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      cancelled = true;
      if (boardRef.current) {
        void loadJXG().then((JXG) => {
          try {
            JXG.JSXGraph.freeBoard(boardRef.current!);
          } catch {
            /* ignore */
          }
          boardRef.current = null;
        });
      }
    };
  }, [
    props.kind,
    props.a,
    props.b,
    props.c,
    props.base,
    props.height,
    props.scale,
    props.side,
    props.r,
    props.special,
  ]);

  return (
    <div className="mx-auto h-52 w-full max-w-md">
      <div
        ref={containerRef}
        className="jxgbox h-full w-full overflow-hidden rounded-lg border border-slate-700/50"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
