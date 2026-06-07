// Reality check: given a configuration, does it need AI, and will it work?
// Pure, rule-based. Friendly + specific: it names exactly what is missing or
// mismatched, instead of a vague "won't work". A complete, sensible flow is workable.

import type { Node, Edge } from "@xyflow/react";
import type { PieceNodeData } from "@/store/canvas";
import { getModels } from "@/lib/catalog";

export type Reality = {
  needsAI: boolean;
  aiSteps: string[]; // labels of steps that use an AI model
  verdict: "empty" | "building" | "workable" | "check";
  todo: string[]; // specific things to add to complete it
  issues: string[]; // genuine mismatches worth fixing
  notes: string[]; // helpful, non-blocking observations
};

const UNSTRUCTURED = ["src-pdf", "src-photo", "src-audio", "src-video", "src-web", "src-file"];

export function realityCheck(nodes: Node<PieceNodeData>[], _edges: Edge[]): Reality {
  if (nodes.length === 0) {
    return { needsAI: false, aiSteps: [], verdict: "empty", todo: [], issues: [], notes: [] };
  }

  const ids = new Set(nodes.map((n) => n.data.pieceId));
  const has = (id: string) => ids.has(id);
  const hasCat = (c: string) => nodes.some((n) => n.data.category === c);

  const aiSteps = nodes
    .filter(
      (n) =>
        getModels(n.data.pieceId) ||
        n.data.category === "rag" ||
        n.data.pieceId === "rd-vision" ||
        n.data.pieceId === "rd-describe"
    )
    .map((n) => n.data.label);
  const needsAI = aiSteps.length > 0;

  const hasSource = hasCat("source");
  const hasStore = hasCat("store");
  const hasRead = hasCat("read");
  const hasEmbed = has("se-embed") || has("se-vectorize");
  const hasVectorStore = has("st-vector");
  const hasQuery = hasCat("query");
  const hasRetrieve = hasCat("retrieve");
  const unstructuredSource = UNSTRUCTURED.some((id) => has(id));

  // Specific "what is missing" guidance.
  const todo: string[] = [];
  if (!hasSource) todo.push("a source (what you feed in)");
  if (unstructuredSource && !hasRead) todo.push("a read step (parse, OCR, or transcribe) to turn files into text");
  if (!hasStore) todo.push("a store (where it lands)");
  if (hasVectorStore && !hasEmbed) todo.push("an embed step to fill the vector database with searchable meaning");

  // Genuine mismatches - "what is wrong".
  const issues: string[] = [];
  if ((has("rt-hops") || has("rt-expand") || has("rt-hyperfilter")) && !(has("st-graph") || has("st-hypergraph"))) {
    issues.push("Graph-style retrieval (hops, path expansion) needs a graph or hypergraph store.");
  }
  if (has("rt-temporal") && !(has("st-timeline") || has("st-episodic"))) {
    issues.push("Time scoring needs an order-aware or episodic store to score against.");
  }
  if (has("rt-spatial") && !(has("src-photo") || has("src-video"))) {
    issues.push("Spatial scoring only helps when you have images or video.");
  }

  // Non-blocking suggestions.
  const notes: string[] = [];
  if (hasStore && !hasQuery && !hasRetrieve) {
    notes.push("Add a query or a RAG type if you want to actually ask it questions.");
  }
  if (!needsAI) notes.push("Can run on rules alone, no AI needed - cheaper and fully local.");
  else notes.push(`Uses AI in ${aiSteps.length} step${aiSteps.length === 1 ? "" : "s"}. Pick open-weight models to stay local.`);

  // Mismatch is more important than incompleteness for the headline.
  let verdict: Reality["verdict"];
  if (issues.length) verdict = "check";
  else if (todo.length) verdict = "building";
  else verdict = "workable";

  return { needsAI, aiSteps, verdict, todo, issues, notes };
}
