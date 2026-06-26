"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Question, VisualizationType } from "@/lib/types";
import { BarChartViz } from "./BarChartViz";
import { CoordinateViz } from "./CoordinateViz";
import { AbstractPatternViz } from "./AbstractPatternViz";
import type { GeometryKind } from "./GeometryViz";
import { ProjectileViz } from "./MatterViz";

const GeometryViz = dynamic(
  () => import("./GeometryViz").then((m) => m.GeometryViz),
  { ssr: false },
);

const ANIMATED: VisualizationType[] = ["matter_projectile"];

interface QuestionVisualizationProps {
  question: Question;
}

export function QuestionVisualization({ question }: QuestionVisualizationProps) {
  const [runKey, setRunKey] = useState(0);
  const { visualization, vizData } = question;
  const isAnimated = ANIMATED.includes(visualization);

  useEffect(() => {
    setRunKey(0);
  }, [question.id]);

  const viz = (() => {
    switch (visualization) {
      case "triangle":
      case "circle":
        return (
          <GeometryViz
            kind={vizData?.kind as GeometryKind | undefined}
            a={vizData?.a as number | undefined}
            b={vizData?.b as number | undefined}
            c={vizData?.c as number | undefined}
            base={vizData?.base as number | undefined}
            height={vizData?.height as number | undefined}
            scale={vizData?.scale as number | undefined}
            side={vizData?.side as number | undefined}
            r={vizData?.r as number | undefined}
            special={vizData?.special as string | undefined}
            hiddenSides={vizData?.hiddenSides as Array<"a" | "b" | "c"> | undefined}
            hideBigSide={vizData?.hideBigSide as boolean | undefined}
          />
        );
      case "coordinate":
        return (
          <CoordinateViz
            kind={vizData?.kind as "linear" | "quadratic_roots" | "quadratic_vertex" | "system" | undefined}
            m={vizData?.m as number | undefined}
            b={vizData?.b as number | undefined}
            c={vizData?.c as number | undefined}
            highlightX={vizData?.highlightX as number | undefined}
            vertex={vizData?.vertex as number[] | undefined}
            roots={vizData?.roots as number[] | undefined}
            system={vizData?.system as number[] | undefined}
            solution={vizData?.solution as number[] | undefined}
            hideHighlight={vizData?.hideHighlight as boolean | undefined}
            hideRoots={vizData?.hideRoots as boolean | undefined}
          />
        );
      case "bar_chart":
        return (
          <BarChartViz
            values={vizData?.values as number[] | undefined}
            segments={vizData?.segments as number[] | undefined}
          />
        );
      case "matter_projectile":
        return (
          <ProjectileViz
            key={runKey}
            angle={vizData?.angle as number | undefined}
            velocity={vizData?.velocity as number | undefined}
          />
        );
      case "abstract_pattern":
        return (
          <AbstractPatternViz
            kind={vizData?.kind as string | undefined}
            cells={vizData?.cells as string[] | undefined}
            matrixCols={vizData?.matrixCols as number | undefined}
            optionShapes={vizData?.optionShapes as string[] | undefined}
          />
        );
      default:
        return null;
    }
  })();

  if (!viz) return null;

  return (
    <div>
      {isAnimated && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setRunKey((k) => k + 1)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-slate-100"
          >
            Replay animation
          </button>
        </div>
      )}
      {viz}
    </div>
  );
}
