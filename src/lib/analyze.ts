// Pure, mock analysis of a pipeline. No API, no real math on data.
// Turns the canvas + tuning knobs into plain-English outcomes/benefits and
// illustrative output meters so you can SEE the effect of tuning.

import type { Node } from "@xyflow/react";
import type { PieceNodeData, Tuning } from "@/store/canvas";
import { getPiece } from "@/lib/catalog";

export type Meter = { label: string; value: number; hint: string };

export type Analysis = {
  tracks: string[]; // ingestion "tracks" detected (one per source kind)
  multiTrack: boolean;
  outcomes: string[]; // what you get
  benefits: string[]; // why it helps
  meters: Meter[]; // illustrative effect of tuning
  unify: string; // the always-on "brought together" line
};

const SOURCE_TRACK: Record<string, string> = {
  "src-pdf": "PDF",
  "src-photo": "photo",
  "src-audio": "audio",
  "src-video": "video",
  "src-web": "web page",
  "src-sheet": "spreadsheet",
  "src-file": "file",
};

const clamp = (n: number) => Math.max(2, Math.min(100, Math.round(n)));

export function analyze(nodes: Node<PieceNodeData>[], t: Tuning): Analysis {
  const ids = new Set(nodes.map((n) => n.data.pieceId));
  const has = (id: string) => ids.has(id);
  const hasCat = (cat: string) => nodes.some((n) => n.data.category === cat);

  // tracks = distinct source kinds on the canvas
  const tracks = Array.from(
    new Set(nodes.filter((n) => n.data.category === "source").map((n) => SOURCE_TRACK[n.data.pieceId] || "file"))
  );

  // Outcomes (what you get) from stores + rag pieces
  const outcomes: string[] = [];
  if (has("st-vector") || hasCat("searchable")) outcomes.push("Vector database: search by meaning across everything.");
  if (has("st-relational")) outcomes.push("Relational database (postgres): tidy rows your apps and dashboards read.");
  if (has("st-hypergraph") || has("rag-hyper")) outcomes.push("Hypergraph: one fact can link many entities at once, with a source trail.");
  if (has("rag-graph")) outcomes.push("GraphRAG: answers that follow links between things.");
  if (has("st-timeline")) outcomes.push("Order aware: a timeline you can ask 'what is the latest'.");
  if (has("st-episodic")) outcomes.push("Episodic memory: a record of what happened and when, built in parallel from the same input.");
  if (has("st-semantic")) outcomes.push("Semantic memory: what things mean, separate from time.");
  if (hasCat("query")) outcomes.push("A way to query it and show the result (dashboard, list, render).");
  if (outcomes.length === 0) outcomes.push("Add a store or a RAG type to see what you get out.");

  // Benefits (why it helps)
  const benefits: string[] = [];
  if (tracks.length > 1) benefits.push("Different file types are handled on their own track, then brought together into one place to query.");
  if (has("rd-extract-table")) benefits.push("Tables stay tables, so numbers do not get scrambled.");
  if (t.rerank) benefits.push("Rerank filters out 'looks similar but wrong' results.");
  if (t.chunkStrategy !== "naive") benefits.push(`${t.chunkStrategy === "late" ? "Late chunking" : "Contextual chunking"} keeps each passage's context, so retrieval misses less.`);
  if (has("st-hypergraph") || has("rag-hyper")) benefits.push("Multi-part questions and 'also reported as' values are answerable, not lost.");
  if (has("st-episodic") && (has("st-semantic") || has("st-vector"))) benefits.push("Episodic and semantic memory run in parallel from the same input, like a brain: one for 'when', one for 'what it means'.");
  if (benefits.length === 0) benefits.push("Add pieces to see the benefits of your choices.");

  // Mock meters: illustrate the effect of the tuning knobs (0..100)
  const sizeNorm = (t.chunkSize - 128) / (2048 - 128); // 0..1 (bigger = more context)
  const dimsNorm = Math.log2(t.embedDims / 256) / Math.log2(3072 / 256); // 0..1
  const strat = t.chunkStrategy === "late" ? 1 : t.chunkStrategy === "contextual" ? 0.7 : 0;

  const g = (t.growth ?? 0) / 100; // 0 day-one .. 1 mature

  const precision = clamp(78 - sizeNorm * 30 + (t.rerank ? 18 : 0) + strat * 8 - t.overlap * 0.1 - g * 8);
  const recall = clamp(48 + sizeNorm * 22 + dimsNorm * 22 + t.overlap * 0.6 + strat * 10 + g * 18);
  const speed = clamp(95 - dimsNorm * 35 - (t.rerank ? 18 : 0) - strat * 12 - t.overlap * 0.3 - g * 14);
  const cost = clamp(28 + dimsNorm * 38 + (t.rerank ? 14 : 0) + strat * 16 + t.overlap * 0.4 + g * 22);
  const storage = clamp(25 + dimsNorm * 45 + t.overlap * 0.8 + sizeNorm * -10 + 20 + g * 30);

  const meters: Meter[] = [
    { label: "Precision", value: precision, hint: "How on-target the hits are." },
    { label: "Recall", value: recall, hint: "How much relevant stuff it finds." },
    { label: "Speed", value: speed, hint: "How fast a query feels." },
    { label: "Cost", value: cost, hint: "Relative spend to run it." },
    { label: "Storage", value: storage, hint: "How much space it takes." },
  ];

  const unify =
    tracks.length > 1
      ? `${tracks.length} tracks (${tracks.join(", ")}) brought together into one place to query.`
      : "Everything is brought together into one place to query.";

  return { tracks, multiTrack: tracks.length > 1, outcomes, benefits, meters, unify };
}
