"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface ProjectileVizProps {
  angle?: number;
  velocity?: number;
}

export function ProjectileViz({ angle = 45, velocity = 12 }: ProjectileVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Engine.create();
    engine.gravity.y = 0.8;

    const render = Render.create({
      element: container,
      engine,
      options: { width, height, wireframes: false, background: "transparent" },
    });

    const ground = Bodies.rectangle(width / 2, height - 5, width, 10, {
      isStatic: true,
      render: { fillStyle: "#334155" },
    });

    const ball = Bodies.circle(40, height - 30, 10, {
      restitution: 0.3,
      render: { fillStyle: "#f97316" },
    });

    const rad = (angle * Math.PI) / 180;
    Body.setVelocity(ball, {
      x: Math.cos(rad) * velocity * 0.8,
      y: -Math.sin(rad) * velocity * 0.8,
    });

    Composite.add(engine.world, [ground, ball]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [angle, velocity]);

  return (
    <div
      ref={containerRef}
      className="h-36 w-full rounded-lg border border-slate-700/40 bg-slate-900/60"
    />
  );
}
