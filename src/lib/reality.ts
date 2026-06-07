// Reality check: given a configuration, will it actually work, and does it need AI?
// Pure, rule-based. No API. Honest about gaps.

import type { Node, Edge } from "@xyflow/react";
import type { PieceNodeData } from "@/store/canvas";
import { getModels } from "@/lib/catalog";

export type Reality = {
  needsAI: boolean;
  aiSteps: string[]; // labels of steps that use an AI model
  verdict: "empty" | "workable" | "gaps";
  issues: string[]; // plain problems that would stop it working
  notes: string[]; // helpful, non-blocking observations
};

export function realityCheck(nodes: Node<PieceNodeData>[], _edges: Edge[]): Reality {
  const ids = new Set(nodes.map((n) => n.data.pieceId));
  const has = (id: string) => ids.has(id);
  const hasCat = (c: string) => nodes.some((n) => n.data.category === c);

  if (nodes.length === 0) {
    return { needsAI: false, aiSteps: [], verdict: "empty", issues: [], notes: ["Add some pieces to check it."] };
  }

  // which steps use an AI model
  const aiSteps = nodes
    .filter((n) => getModels(n.data.pieceId) || n.data.category === "rag" || n.data.pieceId === "rd-vision" || n.data.pieceId === "rd-describe")
    .map((n) => n.data.label);
  const needsAI = aiSteps.length > 0;

  const issues: string[] = [];
  const notes: string[] = [];

  const hasStore = hasCat("store");
  const hasSource = hasCat("source");
  const makesFingerprints = has("se-embed") || has("se-vectorize");
  const hasRead = hasCat("read");
  const hasRetrieve = hasCat("retrieve");
  const hasGraphStore = has("st-graph") || has("st-hypergraph");
  const hasTimeStore = has("st-timeline") || has("st-episodic");
  const hasImageSource = has("src-photo") || has("src-video");

  // feasibility checks
  if (hasSource && !hasRead && !hasStore) issues.push("Your sources do not go anywhere yet - add a read step or a store.");
  if (makesFingerprints && !hasStore) issues.push("You make fingerprints but have no store to keep them in (add a vector database).");
  if (hasStore && !hasSource) issues.push("You have a store but nothing feeding it (add a source).");
  if (hasRetrieve && !hasStore) issues.push("You have retrieval steps but no store to retrieve from.");
  if ((has("rt-hops") || has("rt-hyperfilter") || has("rt-expand")) && !hasGraphStore)
    issues.push("Graph-style retrieval (hops, path expansion, hyperedge filtration) needs a graph or hypergraph store.");
  if (has("rt-temporal") && !hasTimeStore) issues.push("Time scoring needs an order-aware or episodic store to score against.");
  if (has("rt-spatial") && !hasImageSource) issues.push("Spatial scoring only helps when you have images or video.");
  if (has("rag-hyper") && !has("st-hypergraph")) notes.push("HypergraphRAG works best with a hypergraph store on the canvas.");

  // AI-needed note
  if (!needsAI) notes.push("This can run on rules alone, no AI needed - cheaper, faster, fully local.");
  else notes.push(`Uses AI in ${aiSteps.length} step${aiSteps.length === 1 ? "" : "s"}. You can pick open-weight models to keep it local.`);

  const verdict: Reality["verdict"] = issues.length > 0 ? "gaps" : "workable";
  return { needsAI, aiSteps, verdict, issues, notes };
}
