// Pure, mock "cook": run the pipeline in the user's head and show what you END UP WITH.
// No API, no real data. It turns the canvas into:
//   - a picture of each store that lands (with mock numbers to draw)
//   - whether it works right now (from realityCheck)
//   - how it holds up as data grows (analyze meters at growth 0 / 50 / 100)
// Drawing is done in Cook.tsx; this file is the math + verdicts only.

import type { Node, Edge } from "@xyflow/react";
import type { PieceNodeData, Tuning } from "@/store/canvas";
import { getPiece, CATEGORIES } from "@/lib/catalog";
import { analyze, type Meter } from "@/lib/analyze";
import { realityCheck } from "@/lib/reality";

export type StoreKind =
  | "vector"
  | "relational"
  | "graph"
  | "hypergraph"
  | "timeline"
  | "episodic"
  | "semantic"
  | "hierarchy";

// One store that landed on the canvas, with a few mock numbers for its picture.
export type CookedStore = {
  kind: StoreKind;
  pieceId: string;
  label: string; // plain on-screen label
  term: string; // word to feed <Term word="..."> for the hover definition
  color: string; // category color from CATEGORIES
  // mock numbers to draw (only the relevant ones are read per kind)
  points: number; // vector / semantic: how many fingerprints
  nodes: number; // graph / hypergraph / hierarchy: things
  links: number; // graph: two-way links
  facts: number; // hypergraph: n-ary facts (hyperedges)
  events: number; // timeline / episodic: events captured
  rows: number; // relational: rows
  cols: number; // relational: columns
  levels: number; // hierarchy: tree depth
};

export type GrowthStage = "day one" | "growing" | "mature";

export type Snapshot = {
  stage: GrowthStage;
  growth: number; // 0 | 50 | 100
  recall: number; // 0..100
  cost: number; // 0..100
  storage: number; // 0..100
  health: "healthy" | "strained" | "breaks"; // simple verdict at this stage
};

export type CookResult = {
  hasStore: boolean;
  stores: CookedStore[]; // empty -> "nothing to cook yet"
  emptyReason: string; // shown when hasStore is false
  worksNow: {
    verdict: "workable" | "check"; // "empty" is folded into the no-store state
    issues: string[];
    needsAI: boolean;
  };
  overTime: Snapshot[]; // exactly 3: day one / growing / mature
  verdictOverTime: string; // one plain line
};

// Map a store piece id -> its kind + the glossary word for <Term>.
const STORE_KIND: Record<string, { kind: StoreKind; term: string }> = {
  "st-vector": { kind: "vector", term: "vector database" },
  "st-relational": { kind: "relational", term: "relational database" },
  "st-graph": { kind: "graph", term: "graph database" },
  "st-hypergraph": { kind: "hypergraph", term: "hypergraph" },
  "st-timeline": { kind: "timeline", term: "order aware" },
  "st-episodic": { kind: "episodic", term: "episodic memory" },
  "st-semantic": { kind: "semantic", term: "semantic memory" },
  "st-hierarchy": { kind: "hierarchy", term: "summary tree" },
};

const round = (n: number) => Math.max(0, Math.round(n));

// Mock numbers scale with how much is feeding the store: sources + read steps.
// Bigger pipeline -> bigger store. Deterministic, no randomness.
function storeNumbers(kind: StoreKind, feedFactor: number): Partial<CookedStore> {
  const f = feedFactor; // ~1..6
  switch (kind) {
    case "vector":
    case "semantic":
      return { points: round(180 * f) };
    case "relational":
      return { rows: round(120 * f), cols: 3 };
    case "graph":
      return { nodes: round(9 * f), links: round(14 * f) };
    case "hypergraph":
      return { nodes: round(11 * f), facts: round(7 * f) };
    case "timeline":
    case "episodic":
      return { events: round(16 * f) };
    case "hierarchy":
      return { nodes: round(8 * f), levels: 3 + Math.min(2, Math.floor(f / 2)) };
    default:
      return {};
  }
}

function pick(m: Meter[], label: string): number {
  return m.find((x) => x.label === label)?.value ?? 0;
}

// Health at a stage: gaps now means it can break later; high cost/storage strains it.
function stageHealth(
  baseVerdict: "empty" | "building" | "workable" | "check",
  cost: number,
  storage: number,
  recall: number,
): Snapshot["health"] {
  if (baseVerdict === "check") return "breaks";
  if (cost >= 85 || storage >= 88) return "breaks";
  if (cost >= 68 || storage >= 70 || recall < 45) return "strained";
  return "healthy";
}

export function cook(
  nodes: Node<PieceNodeData>[],
  edges: Edge[],
  tuning: Tuning,
): CookResult {
  const storeNodes = nodes.filter((n) => n.data.category === "store");
  const reality = realityCheck(nodes, edges);

  // feedFactor: how much is feeding the stores (sources + read steps), min 1.
  const sourceCount = nodes.filter((n) => n.data.category === "source").length;
  const readCount = nodes.filter((n) => n.data.category === "read").length;
  const feedFactor = Math.max(1, sourceCount + readCount * 0.5);

  // De-dupe store kinds (canvas could hold two of the same store).
  const seen = new Set<StoreKind>();
  const stores: CookedStore[] = [];
  for (const n of storeNodes) {
    const map = STORE_KIND[n.data.pieceId];
    if (!map || seen.has(map.kind)) continue;
    seen.add(map.kind);
    const piece = getPiece(n.data.pieceId);
    stores.push({
      kind: map.kind,
      pieceId: n.data.pieceId,
      label: piece?.label ?? n.data.label,
      term: map.term,
      color: CATEGORIES.store.color,
      points: 0,
      nodes: 0,
      links: 0,
      facts: 0,
      events: 0,
      rows: 0,
      cols: 0,
      levels: 0,
      ...storeNumbers(map.kind, feedFactor),
    });
  }

  const hasStore = stores.length > 0;

  // Over time: re-run analyze at growth 0 / 50 / 100, read the meters that move.
  const stages: { stage: GrowthStage; growth: number }[] = [
    { stage: "day one", growth: 0 },
    { stage: "growing", growth: 50 },
    { stage: "mature", growth: 100 },
  ];
  const overTime: Snapshot[] = stages.map(({ stage, growth }) => {
    const a = analyze(nodes, { ...tuning, growth });
    const recall = pick(a.meters, "Recall");
    const cost = pick(a.meters, "Cost");
    const storage = pick(a.meters, "Storage");
    return {
      stage,
      growth,
      recall,
      cost,
      storage,
      health: stageHealth(reality.verdict, cost, storage, recall),
    };
  });

  const verdictOverTime = buildVerdict(hasStore, overTime, nodes, edges);

  return {
    hasStore,
    stores,
    emptyReason:
      storeNodes.length > 0
        ? "The stores on the canvas are not ones we can picture yet."
        : "Nothing to cook yet. Add a store (like a vector or graph database), then cook.",
    worksNow: {
      verdict: reality.verdict === "check" ? "check" : "workable",
      issues: reality.issues,
      needsAI: reality.needsAI,
    },
    overTime,
    verdictOverTime,
  };
}

function buildVerdict(
  hasStore: boolean,
  snaps: Snapshot[],
  nodes: Node<PieceNodeData>[],
  edges: Edge[],
): string {
  if (!hasStore) return "Add a store, then cook to see how it holds up as data grows.";

  const mature = snaps[snaps.length - 1];
  const ids = new Set(nodes.map((n) => n.data.pieceId));
  // Incremental setup signals: dedup / cross-reference / flag-gaps / canonical keep
  // an existing store correct as new data arrives, instead of a full rebuild.
  const hasIncremental =
    ids.has("rs-dedup") ||
    ids.has("rs-crossref") ||
    ids.has("rs-flag") ||
    ids.has("rs-canonical");

  // The pie question: can you keep baking as you add, or must you re-mix and rebake?
  const mode = hasIncremental
    ? "Rolling ingestion: you can bake as you add and keep topping it off with more, no full re-mix."
    : "Right now you would re-mix everything and rebake each time you add. Add dedup or cross-reference to switch to rolling ingestion (bake as you add).";

  if (mature.health === "breaks") {
    if (snaps[0].health !== "breaks") {
      return "Works on day one, but breaks as data grows. " + mode;
    }
    return "Has gaps that stop it working. Fix those first, before worrying about growth.";
  }

  if (mature.health === "strained") {
    return "Keeps working as it grows, but cost and storage rise (budget for it or trim the embedding size). " + mode;
  }

  return "Stays healthy as it grows. " + mode;
}
