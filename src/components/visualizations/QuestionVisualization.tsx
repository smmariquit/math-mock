"use client";

import dynamic from "next/dynamic";
import type { Question } from "@/lib/types";
import { BarChartViz } from "./BarChartViz";
import { CoordinateViz } from "./CoordinateViz";
import type { GeometryKind } from "./GeometryViz";
import { ProjectileViz } from "./MatterViz";

const GeometryViz = dynamic(
  () => import("./GeometryViz").then((m) => m.GeometryViz),
  { ssr: false },
);

interface QuestionVisualizationProps {
  question: Question;
}

export function QuestionVisualization({ question }: QuestionVisualizationProps) {
  const { visualization, vizData } = question;

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
          angle={vizData?.angle as number | undefined}
          velocity={vizData?.velocity as number | undefined}
        />
      );
    default:
      return null;
  }
}
