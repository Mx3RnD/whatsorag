// Simulation harness: feed real configs through the brain and print results.
// Run: npx tsx scripts/sim.ts
import { getPiece } from "@/lib/catalog";
import { analyze } from "@/lib/analyze";
import { recommend } from "@/lib/recommend";
import { realityCheck } from "@/lib/reality";
import type { Tuning } from "@/store/canvas";

const T: Tuning = { chunkSize: 600, overlap: 12, embedDims: 1536, rerank: true, chunkStrategy: "contextual", growth: 0 };

function nodes(ids: string[]) {
  return ids.map((id, i) => {
    const p = getPiece(id);
    return { id: `n${i}`, position: { x: 0, y: 0 }, data: { pieceId: id, label: p?.label ?? id, category: p?.category ?? "source", color: "#000" } };
  }) as any;
}

const CONFIGS: Record<string, string[]> = {
  "Plain text RAG": ["src-file", "rd-parse", "se-chunk", "se-embed", "st-vector", "qo-query"],
  "Audio meeting log": ["src-audio", "rd-transcribe", "rs-fingerprint", "st-episodic", "st-timeline", "qo-query"],
  "Ingredient docs (graph)": ["src-pdf", "rd-extract-table", "rs-entity", "rs-relationship", "rs-canonical", "st-relational", "st-graph", "qo-answer"],
  "Hypergraph + retrieval": ["src-pdf", "rs-entity", "st-hypergraph", "rag-hyper", "rt-route", "rt-hops", "rt-hyperfilter", "rt-rerank", "qo-answer"],
  "BROKEN: embed no store": ["src-file", "se-embed"],
  "BROKEN: spatial no images": ["src-pdf", "st-vector", "rt-spatial"],
  "Empty": [],
};

for (const [name, ids] of Object.entries(CONFIGS)) {
  const ns = nodes(ids);
  const rec = recommend(ns);
  const r = realityCheck(ns, []);
  const a = analyze(ns, T);
  console.log("\n=== " + name + " ===");
  console.log("recommend :", rec.architecture, "(" + rec.confidence + ")");
  console.log("reality   :", r.verdict, "| needsAI:", r.needsAI, r.needsAI ? "(" + r.aiSteps.length + " steps)" : "");
  if (r.issues.length) console.log("issues    :", r.issues.join(" | "));
  console.log("outcomes  :", a.outcomes.length, "| benefits:", a.benefits.length);
}
