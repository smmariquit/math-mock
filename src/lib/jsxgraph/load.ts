"use client";

/** Browser-only JSXGraph loader (the library touches window at import time). */
export async function loadJXG(): Promise<typeof JXG> {
  const mod = await import("jsxgraph");
  return ((mod as { default?: typeof JXG }).default ?? mod) as typeof JXG;
}

export const JXG_BOARD_OPTS = {
  axis: false,
  showNavigation: false,
  showCopyright: false,
  keepaspectratio: true,
  resize: { enabled: false, throttle: 100 },
  pan: { enabled: false },
  zoom: { wheel: false },
  renderer: "svg" as const,
};

export const JXG_DARK = {
  stroke: "#60a5fa",
  fill: "rgba(59,130,246,0.18)",
  label: { strokeColor: "#cbd5e1", fontSize: 15, cssStyle: "font-family: system-ui, sans-serif;" },
  accent: "#fb923c",
  purple: "#c084fc",
  grid: "#475569",
};
