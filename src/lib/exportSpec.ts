// Build a complete, end-to-end Markdown spec/prompt from the current pipeline.
// This is the export: keep it as your spec, or paste it into an AI as a build prompt.
// v1 does NOT write code - it writes the plan.

import type { Node, Edge } from "@xyflow/react";
import type { PieceNodeData, Tuning } from "@/store/canvas";
import { CATEGORIES, getPiece, type CategoryKey } from "@/lib/catalog";
import { analyze } from "@/lib/analyze";

const ORDER: CategoryKey[] = ["source", "identify", "read", "searchable", "resolve", "store", "query", "rag"];

export function buildSpecMarkdown(
  name: string,
  nodes: Node<PieceNodeData>[],
  edges: Edge[],
  tuning: Tuning
): string {
  const a = analyze(nodes, tuning);
  const L: string[] = [];
  const title = name?.trim() || "Untitled pipeline";

  L.push(`# ${title}`);
  L.push("");
  L.push("> Built with whatsoRAG - a webapp that helps you figure out how you are going to ingest, extract, and RAG.");
  L.push("> This is a plan/prompt, not code.");
  L.push("");

  L.push("## What this pipeline does");
  L.push("");
  L.push(a.unify);
  L.push("");

  // Pieces grouped by stage, in order
  L.push("## The pieces (in order)");
  L.push("");
  ORDER.forEach((cat) => {
    const inCat = nodes.filter((n) => n.data.category === cat);
    if (inCat.length === 0) return;
    L.push(`### ${CATEGORIES[cat].label}`);
    inCat.forEach((n) => {
      const p = getPiece(n.data.pieceId);
      const choice = n.data.choice ? ` — using **${n.data.choice}**` : "";
      L.push(`- **${n.data.label}**${choice}: ${p?.blurb ?? ""}`);
    });
    L.push("");
  });

  // Connections
  if (edges.length) {
    L.push("## How they connect");
    L.push("");
    edges.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source)?.data.label ?? e.source;
      const t = nodes.find((n) => n.id === e.target)?.data.label ?? e.target;
      L.push(`- ${s} → ${t}`);
    });
    L.push("");
  }

  // Tuning
  L.push("## Tuning");
  L.push("");
  L.push(`- Chunk size: ${tuning.chunkSize} tokens`);
  L.push(`- Overlap: ${tuning.overlap}%`);
  L.push(`- Chunk strategy: ${tuning.chunkStrategy}`);
  L.push(`- Embed size (fingerprint dims): ${tuning.embedDims}`);
  L.push(`- Rerank: ${tuning.rerank ? "on" : "off"}`);
  L.push("");

  // Outcomes + benefits
  L.push("## What you get");
  L.push("");
  a.outcomes.forEach((o) => L.push(`- ${o}`));
  L.push("");
  L.push("## Benefits");
  L.push("");
  a.benefits.forEach((b) => L.push(`- ${b}`));
  L.push("");

  // Illustrative meters
  L.push("## Illustrative tradeoffs (mock)");
  L.push("");
  a.meters.forEach((m) => L.push(`- ${m.label}: ${m.value}/100 — ${m.hint}`));
  L.push("");

  // Build prompt
  L.push("## Prompt to build this");
  L.push("");
  L.push("You are building the pipeline described above. Implement it end to end:");
  L.push("");
  L.push("1. Ingest the listed sources; identify each file by content (not extension) and route to its track.");
  L.push("2. Read/parse each track as specified (keep tables as tables).");
  L.push("3. Chunk and embed with the tuning above; index for search.");
  L.push("4. Resolve entities (dedup, normalize, canonical/aka) and build the listed store(s).");
  L.push("5. Wire the RAG type and the query/output surface.");
  L.push("6. Preserve a source trail (provenance) on every fact for citations.");
  L.push("");
  L.push("State your model choices (open-weight vs frontier) and where each runs.");
  L.push("");

  return L.join("\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
