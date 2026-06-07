"use client";

import type { ReactNode } from "react";
import { defineTerm } from "@/lib/glossary";

// Shows a word; if it is a non-business term, dotted-underline it with a hover definition.
export function Term({ word, children }: { word?: string; children?: ReactNode }) {
  const text = children ?? word ?? "";
  const lookup = (word ?? (typeof children === "string" ? children : "")) as string;
  const def = lookup ? defineTerm(lookup) : undefined;
  if (!def) return <>{text}</>;
  return (
    <span
      title={def}
      className="cursor-help underline decoration-dotted decoration-neutral-400 underline-offset-2"
    >
      {text}
    </span>
  );
}
