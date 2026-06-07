// Pure helpers for the "Data shape" selector.
// Takes the characteristics the user picks about their data and derives:
//   1. a RECOMMENDED set of catalog piece ids (the combo),
//   2. React Flow "piece" nodes + edges laid out left-to-right by stage,
//   3. a Tuning preset derived from DEFAULT_TUNING,
//   4. illustrative tradeoff bars (precision / recall / speed / cost / storage).
// No side effects, no API. All numbers are mock/illustrative.

import type { Node, Edge } from "@xyflow/react";
import { getPiece, getModels, CATEGORIES, type CategoryKey } from "@/lib/catalog";
import { DEFAULT_TUNING, type Tuning, type PieceNodeData } from "@/store/canvas";

// ---- The characteristics we expose on screen ----

export type Modality = "text" | "pdf" | "photo" | "audio" | "video";

export type DataShape = {
  modalities: Modality[];
  hasTables: boolean;
  multilingual: boolean;
  multiSpeaker: boolean;
  needProvenance: boolean;
  schema: "defined" | "undefined";
  cadence: "batch" | "ongoing";
};

export const DEFAULT_SHAPE: DataShape = {
  modalities: ["text"],
  hasTables: false,
  multilingual: false,
  multiSpeaker: false,
  needProvenance: false,
  schema: "undefined",
  cadence: "batch",
};

// Map a modality to its catalog source piece id.
const MODALITY_SOURCE: Record<Modality, string> = {
  text: "src-file",
  pdf: "src-pdf",
  photo: "src-photo",
  audio: "src-audio",
  video: "src-video",
};

// ---- 1. Derive the recommended set of catalog piece ids ----

// Returns the recommended piece ids in stage order, de-duplicated.
// Each rule says "if the data looks like X, add these pieces."
export function recommendPieceIds(shape: DataShape): string[] {
  const ids: string[] = [];
  const add = (...xs: string[]) => xs.forEach((x) => ids.push(x));

  const mods = shape.modalities.length ? shape.modalities : (["text"] as Modality[]);
  const visual = mods.includes("pdf") || mods.includes("photo") || mods.includes("video");
  const spoken = mods.includes("audio") || mods.includes("video");

  // Sources: one per modality the user has.
  mods.forEach((m) => add(MODALITY_SOURCE[m]));

  // Identify: always sort each file; add language detection when multilingual,
  // and multimodal routing when more than one modality is present.
  add("id-identify");
  if (mods.length > 1) add("id-multimodal");
  if (shape.multilingual) add("id-language");

  // Read: turn each file into text/tables.
  add("rd-parse");
  add("rd-extract-txt");
  if (shape.hasTables) add("rd-extract-table");
  if (visual) add("rd-vision"); // look at the page/photo/frame
  if (mods.includes("pdf") || mods.includes("photo")) add("rd-ocr");
  if (mods.includes("video")) add("rd-freeze");
  if (spoken) add("rd-transcribe");

  // Make searchable: everything gets chunked, embedded, indexed.
  add("se-chunk", "se-embed", "se-index");

  // Resolve: pull entities + relationships; extra trail / fingerprint / canonical as needed.
  add("rs-entity", "rs-relationship");
  if (shape.needProvenance) add("rs-bbox"); // bounding box = source trail for citations
  if (shape.multiSpeaker || spoken) add("rs-fingerprint"); // attribute to who spoke/wrote
  if (shape.schema === "defined") add("rs-canonical"); // map to known fields
  else add("rs-flag"); // open discovery: flag items missing context for review

  // Stores: defined -> relational; undefined -> graph/hypergraph for open discovery.
  add("st-vector"); // search by meaning is always useful
  if (shape.schema === "defined") {
    add("st-relational");
  } else {
    add("st-graph", "st-hypergraph"); // n-ary facts + open structure
  }
  if (shape.cadence === "ongoing") add("st-timeline"); // keep order as data arrives

  // Query + RAG type.
  add("qo-query");
  if (shape.needProvenance) add("qo-answer"); // answer WITH its source trail
  if (shape.schema === "defined") add("rag-rag");
  else add("rag-hyper"); // HypergraphRAG for open, n-ary data

  // De-dupe while keeping first-seen order.
  return Array.from(new Set(ids));
}

// ---- 2. Build React Flow nodes + edges from the recommended ids ----

const STAGE_ORDER: CategoryKey[] = [
  "source",
  "identify",
  "read",
  "searchable",
  "resolve",
  "store",
  "query",
  "rag",
];

const COLUMN_WIDTH = 240;
const ROW_HEIGHT = 110;
const TOP_OFFSET = 0;

// Lay the chosen pieces out left-to-right by stage, stacked per column, and wire
// each stage's nodes to the next stage's nodes (a sensible left-to-right flow).
export function buildGraph(ids: string[]): {
  nodes: Node<PieceNodeData>[];
  edges: Edge[];
} {
  const rowByCol: Record<number, number> = {};
  const nodes: Node<PieceNodeData>[] = [];
  const idByStage: Record<number, string[]> = {};

  ids.forEach((pieceId) => {
    const p = getPiece(pieceId);
    if (!p) return;
    const col = STAGE_ORDER.indexOf(p.category);
    const c = col === -1 ? STAGE_ORDER.length : col;
    const row = rowByCol[c] ?? 0;
    rowByCol[c] = row + 1;

    const nodeId = `ds-${pieceId}`;
    nodes.push({
      id: nodeId,
      type: "piece",
      position: { x: c * COLUMN_WIDTH, y: TOP_OFFSET + row * ROW_HEIGHT },
      data: {
        pieceId: p.id,
        label: p.label,
        category: p.category,
        color: CATEGORIES[p.category].color,
        choice: p.options?.[0],
        model: getModels(p.id)?.[0],
      },
    });
    (idByStage[c] ??= []).push(nodeId);
  });

  // Edges: connect every node in a populated stage to every node in the next
  // populated stage, so the flow reads cleanly left-to-right.
  const edges: Edge[] = [];
  const populated = Object.keys(idByStage)
    .map(Number)
    .sort((a, b) => a - b);
  for (let i = 0; i < populated.length - 1; i++) {
    const from = idByStage[populated[i]];
    const to = idByStage[populated[i + 1]];
    from.forEach((s) =>
      to.forEach((t) =>
        edges.push({ id: `e-${s}-${t}`, source: s, target: t, animated: true })
      )
    );
  }

  return { nodes, edges };
}

// ---- 3. Tuning derived from the shape ----

export function buildTuning(shape: DataShape): Tuning {
  const visual =
    shape.modalities.includes("pdf") ||
    shape.modalities.includes("photo") ||
    shape.modalities.includes("video");
  return {
    ...DEFAULT_TUNING,
    // Visually rich data benefits from contextual chunking; otherwise keep default.
    chunkStrategy: visual ? "contextual" : DEFAULT_TUNING.chunkStrategy,
    // Provenance work leans on rerank to keep cited hits tight.
    rerank: shape.needProvenance ? true : DEFAULT_TUNING.rerank,
    // Ongoing data means the store keeps growing: nudge the growth dial up.
    growth: shape.cadence === "ongoing" ? 30 : 0,
  };
}

// ---- 4. Illustrative tradeoff bars ----

export type ShapeMeter = { label: string; value: number; hint: string };

const clamp = (n: number) => Math.max(2, Math.min(100, Math.round(n)));

// Simple heuristic: each characteristic nudges precision/recall/speed/cost/storage.
// All numbers are mock/illustrative, just enough to SEE the tradeoffs move.
export function shapeMeters(shape: DataShape): ShapeMeter[] {
  const mods = shape.modalities.length ? shape.modalities : (["text"] as Modality[]);
  const spoken = mods.includes("audio") || mods.includes("video");
  const visual = mods.includes("pdf") || mods.includes("photo") || mods.includes("video");
  const m = mods.length; // breadth of modalities

  // Start from a plain-text baseline and adjust.
  let precision = 70;
  let recall = 55;
  let speed = 85;
  let cost = 30;
  let storage = 30;

  // More modalities: more recall and coverage, slower and more expensive.
  recall += (m - 1) * 6;
  speed -= (m - 1) * 7;
  cost += (m - 1) * 8;
  storage += (m - 1) * 7;

  // Spoken audio/video: transcription adds cost and a little noise (precision dip).
  if (spoken) {
    precision -= 6;
    cost += 8;
    speed -= 6;
  }
  // Visual (vision/OCR): strong recall on tables/figures, heavier to run.
  if (visual) {
    recall += 6;
    cost += 8;
    speed -= 6;
  }
  // Tables kept as tables: precision up (numbers stay intact).
  if (shape.hasTables) {
    precision += 6;
    storage += 4;
  }
  // Multilingual: detect + normalize across languages helps recall, costs a bit.
  if (shape.multilingual) {
    recall += 5;
    cost += 5;
  }
  // Multi-speaker fingerprinting: more precise attribution, extra work.
  if (shape.multiSpeaker) {
    precision += 4;
    cost += 5;
    speed -= 4;
  }
  // Provenance + rerank: precise, cited hits, at a speed/cost price.
  if (shape.needProvenance) {
    precision += 8;
    speed -= 8;
    cost += 6;
    storage += 8; // store the source trail / boxes
  }
  // Schema: defined -> tidy and fast; undefined -> graph/hypergraph -> recall + cost + storage.
  if (shape.schema === "defined") {
    precision += 6;
    speed += 6;
    cost -= 4;
  } else {
    recall += 10;
    cost += 10;
    storage += 12;
    speed -= 6;
  }
  // Cadence: ongoing means the store grows -> more recall over time, more cost/storage.
  if (shape.cadence === "ongoing") {
    recall += 8;
    cost += 8;
    storage += 12;
  }

  return [
    { label: "Precision", value: clamp(precision), hint: "How on-target the hits are." },
    { label: "Recall", value: clamp(recall), hint: "How much relevant stuff it finds." },
    { label: "Speed", value: clamp(speed), hint: "How fast a query feels." },
    { label: "Cost", value: clamp(cost), hint: "Relative spend to run it." },
    { label: "Storage", value: clamp(storage), hint: "How much space it takes." },
  ];
}
