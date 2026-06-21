"use client";

import katex from "katex";
import { useMemo } from "react";

interface LatexProps {
  children: string;
  block?: boolean;
  className?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderLatexFragment(latex: string, displayMode: boolean): string {
  return katex.renderToString(latex.trim(), {
    throwOnError: false,
    displayMode,
  });
}

/** Parse strings with inline $...$, display $$...$$, or \[...\] delimiters. */
function renderMixedLatex(input: string): string {
  const pattern = /\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|\$([^$\\]*(?:\\.[^$\\]*)*)\$/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(input.slice(lastIndex, match.index)));
    }

    const display = match[1] !== undefined || match[2] !== undefined;
    const latex = (match[1] ?? match[2] ?? match[3])!;
    parts.push(renderLatexFragment(latex, display));
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push(escapeHtml(input.slice(lastIndex)));
  }

  // Parsed delimiters — return mixed HTML; otherwise fall back to plain text
  return parts.length > 0 ? parts.join("") : escapeHtml(input);
}

function hasMathDelimiters(input: string): boolean {
  return /\\\[|\$\$|\$[^$]+\$/.test(input);
}

function renderContent(input: string): string {
  if (!hasMathDelimiters(input)) {
    return escapeHtml(input);
  }
  return renderMixedLatex(input);
}

export function Latex({ children, block = false, className = "" }: LatexProps) {
  const html = useMemo(() => {
    try {
      return renderContent(children);
    } catch {
      return escapeHtml(children);
    }
  }, [children, block]);

  if (block) {
    return (
      <div
        className={`katex-block overflow-x-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`katex-inline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
