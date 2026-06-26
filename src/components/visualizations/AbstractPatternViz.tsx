"use client";

import { parseAbstractCells, type AbstractCell } from "@/lib/questions/abstract-reasoning";

interface AbstractPatternVizProps {
  kind?: string;
  cells?: string[];
  matrixCols?: number;
  optionShapes?: string[];
}

const CELL = 56;
const GAP = 12;

function ShapeGlyph({ cell, size = CELL }: { cell: AbstractCell; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const stroke = cell.filled ? "none" : "currentColor";
  const fill = cell.filled ? "currentColor" : "none";
  const sw = 2;

  if (cell.dots !== undefined && cell.dots >= 0) {
    const n = cell.dots;
    const cols = Math.ceil(Math.sqrt(n));
    const dotR = Math.max(2, size / (cols * 3));
    const positions: { x: number; y: number }[] = [];
    let placed = 0;
    for (let row = 0; row < cols && placed < n; row += 1) {
      const rowCount = Math.min(cols - row, n - placed);
      for (let col = 0; col < rowCount; col += 1) {
        positions.push({
          x: cx - ((rowCount - 1) * (dotR * 2 + 2)) / 2 + col * (dotR * 2 + 2),
          y: cy - ((cols - 1) * (dotR * 2 + 2)) / 2 + row * (dotR * 2 + 2),
        });
        placed += 1;
      }
    }
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-slate-200">
        {positions.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={dotR} fill="currentColor" />
        ))}
      </svg>
    );
  }

  if (cell.dots === -1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-slate-500">
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={22} fill="currentColor">
          ?
        </text>
      </svg>
    );
  }

  const rot = cell.rotation ?? 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="text-slate-200"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      {cell.shape === "circle" && (
        <circle cx={cx} cy={cy} r={size * 0.28} fill={fill} stroke={stroke} strokeWidth={sw} />
      )}
      {cell.shape === "square" && (
        <rect
          x={size * 0.18}
          y={size * 0.18}
          width={size * 0.64}
          height={size * 0.64}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      )}
      {cell.shape === "triangle" && (
        <polygon
          points={`${cx},${size * 0.14} ${size * 0.86},${size * 0.82} ${size * 0.14},${size * 0.82}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )}
      {cell.shape === "diamond" && (
        <polygon
          points={`${cx},${size * 0.12} ${size * 0.88},${cy} ${cx},${size * 0.88} ${size * 0.12},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function AbstractPatternViz({ kind, cells, matrixCols, optionShapes }: AbstractPatternVizProps) {
  const parsed = parseAbstractCells(cells);

  if (parsed.length === 0) return null;

  const stimulus = (() => {
    if (kind === "matrix" && matrixCols) {
      const rows = Math.ceil(parsed.length / matrixCols);
      return (
        <div
          className="inline-grid gap-2"
          style={{ gridTemplateColumns: `repeat(${matrixCols}, ${CELL}px)` }}
        >
          {parsed.map((cell, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80"
              style={{ width: CELL, height: CELL }}
            >
              <ShapeGlyph cell={cell} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        {parsed.map((cell, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80"
            style={{ width: CELL, height: CELL }}
          >
            <ShapeGlyph cell={cell} />
          </div>
        ))}
        {kind === "sequence" && (
          <span className="text-2xl text-slate-500" aria-hidden>
            →
          </span>
        )}
      </div>
    );
  })();

  const choices = parseAbstractCells(optionShapes);

  return (
    <div className="space-y-4">
      {stimulus}
      {choices.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-500">Answer choices (match labels A–D below)</p>
          <div className="flex flex-wrap gap-4">
            {choices.map((cell, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-400">{String.fromCharCode(65 + i)}</span>
                <div
                  className="flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800/80"
                  style={{ width: CELL, height: CELL }}
                >
                  <ShapeGlyph cell={cell} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AbstractOptionShape({ encoded }: { encoded: string }) {
  const cell = parseAbstractCells([encoded])[0];
  if (!cell) return null;
  return (
    <span className="inline-flex align-middle">
      <ShapeGlyph cell={cell} size={32} />
    </span>
  );
}
