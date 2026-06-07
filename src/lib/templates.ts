// Starter templates: loadable, pre-wired pipelines built from EXISTING catalog pieces only.
// Each template is a set of React Flow "piece" nodes + edges + a Tuning preset.
// On-screen names/descriptions use Pal's approved vocabulary.

import type { Node, Edge } from "@xyflow/react";
import { getPiece, CATEGORIES } from "@/lib/catalog";
import { DEFAULT_TUNING, type Tuning, type PieceNodeData } from "@/store/canvas";

export type Template = {
  key: string;
  name: string;
  description: string;
  nodes: Node<PieceNodeData>[];
  edges: Edge[];
  tuning: Tuning;
};

// Column x-position per stage so nodes flow left-to-right.
const STAGE_X: Record<string, number> = {
  source: 0,
  identify: 240,
  read: 480,
  searchable: 720,
  resolve: 960,
  store: 1200,
  query: 1440,
  rag: 1680,
};

const ROW_H = 110;

// Build a node from a catalog id. Throws at author time if the id is wrong.
function node(
  localId: string,
  pieceId: string,
  row: number,
  choice?: string
): Node<PieceNodeData> {
  const p = getPiece(pieceId);
  if (!p) throw new Error(`templates.ts: unknown piece id "${pieceId}"`);
  const color = CATEGORIES[p.category].color;
  return {
    id: localId,
    type: "piece",
    position: { x: STAGE_X[p.category] ?? 0, y: row * ROW_H },
    data: {
      pieceId: p.id,
      label: p.label,
      category: p.category,
      color,
      choice: choice ?? p.options?.[0],
    },
  };
}

// Connect a straight chain of node ids in order.
function chain(ids: string[], prefix: string): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({
      id: `${prefix}_e${i}`,
      source: ids[i],
      target: ids[i + 1],
      animated: true,
    });
  }
  return edges;
}

// A single explicit edge.
function edge(prefix: string, n: number, source: string, target: string): Edge {
  return { id: `${prefix}_x${n}`, source, target, animated: true };
}

// ----------------------------------------------------------------------------
// 1. Master pipeline — every stage, the full reference flow.
// ----------------------------------------------------------------------------
function masterPipeline(): Template {
  const k = "master";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_src`, "src-file", 1),
    node(`${k}_id`, "id-identify", 1),
    node(`${k}_parse`, "rd-parse", 0),
    node(`${k}_ocr`, "rd-ocr", 1),
    node(`${k}_trans`, "rd-transcribe", 2),
    node(`${k}_table`, "rd-extract-table", 3),
    node(`${k}_chunk`, "se-chunk", 1),
    node(`${k}_embed`, "se-embed", 1),
    node(`${k}_index`, "se-index", 1),
    node(`${k}_entity`, "rs-entity", 0),
    node(`${k}_rel`, "rs-relationship", 1),
    node(`${k}_canon`, "rs-canonical", 2),
    node(`${k}_dedup`, "rs-dedup", 3),
    node(`${k}_vec`, "st-vector", 0),
    node(`${k}_rel2`, "st-relational", 1),
    node(`${k}_hyper`, "st-hypergraph", 2),
    node(`${k}_query`, "qo-query", 1),
    node(`${k}_rerank`, "qo-rerank", 0),
    node(`${k}_dash`, "qo-dashboard", 2),
    node(`${k}_rag`, "rag-anything", 1),
  ];
  const edges: Edge[] = [
    edge(k, 1, `${k}_src`, `${k}_id`),
    edge(k, 2, `${k}_id`, `${k}_parse`),
    edge(k, 3, `${k}_id`, `${k}_ocr`),
    edge(k, 4, `${k}_id`, `${k}_trans`),
    edge(k, 5, `${k}_id`, `${k}_table`),
    edge(k, 6, `${k}_parse`, `${k}_chunk`),
    edge(k, 7, `${k}_ocr`, `${k}_chunk`),
    edge(k, 8, `${k}_trans`, `${k}_chunk`),
    edge(k, 9, `${k}_table`, `${k}_entity`),
    edge(k, 10, `${k}_chunk`, `${k}_embed`),
    edge(k, 11, `${k}_embed`, `${k}_index`),
    edge(k, 12, `${k}_chunk`, `${k}_entity`),
    edge(k, 13, `${k}_entity`, `${k}_rel`),
    edge(k, 14, `${k}_rel`, `${k}_canon`),
    edge(k, 15, `${k}_canon`, `${k}_dedup`),
    edge(k, 16, `${k}_index`, `${k}_vec`),
    edge(k, 17, `${k}_dedup`, `${k}_rel2`),
    edge(k, 18, `${k}_rel`, `${k}_hyper`),
    edge(k, 19, `${k}_vec`, `${k}_query`),
    edge(k, 20, `${k}_rel2`, `${k}_query`),
    edge(k, 21, `${k}_hyper`, `${k}_query`),
    edge(k, 22, `${k}_query`, `${k}_rerank`),
    edge(k, 23, `${k}_rerank`, `${k}_dash`),
    edge(k, 24, `${k}_dash`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Master pipeline",
    description: "The full reference flow: every stage from source to answer.",
    nodes,
    edges,
    tuning: { ...DEFAULT_TUNING, growth: 60 },
  };
}

// ----------------------------------------------------------------------------
// 2. Competitor intelligence dashboard — web + PDF, entities + relationships,
//    graph-style retrieval into a dashboard.
// ----------------------------------------------------------------------------
function competitorIntel(): Template {
  const k = "competitor";
  const ids = [
    node(`${k}_web`, "src-web", 0),
    node(`${k}_pdf`, "src-pdf", 1),
    node(`${k}_id`, "id-identify", 0),
    node(`${k}_parse`, "rd-parse", 0),
    node(`${k}_chunk`, "se-chunk", 0),
    node(`${k}_embed`, "se-embed", 0),
    node(`${k}_index`, "se-index", 0),
    node(`${k}_entity`, "rs-entity", 1),
    node(`${k}_rel`, "rs-relationship", 2),
    node(`${k}_canon`, "rs-canonical", 0),
    node(`${k}_hyper`, "st-hypergraph", 0),
    node(`${k}_query`, "qo-query", 0),
    node(`${k}_rerank`, "qo-rerank", 1),
    node(`${k}_dash`, "qo-dashboard", 0),
    node(`${k}_rag`, "rag-graph", 0),
  ];
  const edges: Edge[] = [
    edge(k, 1, `${k}_web`, `${k}_id`),
    edge(k, 2, `${k}_pdf`, `${k}_id`),
    edge(k, 3, `${k}_id`, `${k}_parse`),
    edge(k, 4, `${k}_parse`, `${k}_chunk`),
    edge(k, 5, `${k}_chunk`, `${k}_embed`),
    edge(k, 6, `${k}_embed`, `${k}_index`),
    edge(k, 7, `${k}_parse`, `${k}_entity`),
    edge(k, 8, `${k}_entity`, `${k}_rel`),
    edge(k, 9, `${k}_entity`, `${k}_canon`),
    edge(k, 10, `${k}_rel`, `${k}_hyper`),
    edge(k, 11, `${k}_index`, `${k}_query`),
    edge(k, 12, `${k}_hyper`, `${k}_query`),
    edge(k, 13, `${k}_query`, `${k}_rerank`),
    edge(k, 14, `${k}_rerank`, `${k}_dash`),
    edge(k, 15, `${k}_dash`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Competitor intelligence dashboard",
    description: "Read the web and filings, link who-does-what, watch it on a dashboard.",
    nodes: ids,
    edges,
    tuning: { ...DEFAULT_TUNING, growth: 40 },
  };
}

// ----------------------------------------------------------------------------
// 3. Sales dashboard — spreadsheets into a relational store, ordered over time,
//    shown as a dashboard. Light on retrieval, heavy on tables.
// ----------------------------------------------------------------------------
function salesDashboard(): Template {
  const k = "sales";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_sheet`, "src-sheet", 0),
    node(`${k}_id`, "id-identify", 0),
    node(`${k}_table`, "rd-extract-table", 0),
    node(`${k}_dedup`, "rs-dedup", 0),
    node(`${k}_rel`, "st-relational", 0),
    node(`${k}_time`, "st-timeline", 1),
    node(`${k}_query`, "qo-query", 0),
    node(`${k}_dash`, "qo-dashboard", 0),
    node(`${k}_rag`, "rag-rag", 0),
  ];
  const edges: Edge[] = [
    ...chain(
      [`${k}_sheet`, `${k}_id`, `${k}_table`, `${k}_dedup`, `${k}_rel`],
      k
    ),
    edge(k, 1, `${k}_rel`, `${k}_time`),
    edge(k, 2, `${k}_rel`, `${k}_query`),
    edge(k, 3, `${k}_time`, `${k}_query`),
    edge(k, 4, `${k}_query`, `${k}_dash`),
    edge(k, 5, `${k}_dash`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Sales dashboard",
    description: "Pull numbers from spreadsheets, keep the timeline, chart the trend.",
    nodes,
    edges,
    tuning: { ...DEFAULT_TUNING, rerank: false, chunkStrategy: "naive", growth: 20 },
  };
}

// ----------------------------------------------------------------------------
// 4. Formula database — PDFs + spreadsheets, tables + entities, canonical names,
//    dedup, into a relational + vector store. Built for ingredient/formula data.
// ----------------------------------------------------------------------------
function formulaDatabase(): Template {
  const k = "formula";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_pdf`, "src-pdf", 0),
    node(`${k}_sheet`, "src-sheet", 1),
    node(`${k}_id`, "id-identify", 0),
    node(`${k}_parse`, "rd-parse", 0),
    node(`${k}_table`, "rd-extract-table", 1),
    node(`${k}_chunk`, "se-chunk", 0),
    node(`${k}_embed`, "se-embed", 0),
    node(`${k}_index`, "se-index", 0),
    node(`${k}_entity`, "rs-entity", 1),
    node(`${k}_canon`, "rs-canonical", 2, "aka"),
    node(`${k}_dedup`, "rs-dedup", 3),
    node(`${k}_rel`, "st-relational", 0),
    node(`${k}_vec`, "st-vector", 1),
    node(`${k}_query`, "qo-query", 0),
    node(`${k}_rerank`, "qo-rerank", 1),
    node(`${k}_list`, "qo-list", 0),
    node(`${k}_rag`, "rag-rag", 0),
  ];
  const edges: Edge[] = [
    edge(k, 1, `${k}_pdf`, `${k}_id`),
    edge(k, 2, `${k}_sheet`, `${k}_id`),
    edge(k, 3, `${k}_id`, `${k}_parse`),
    edge(k, 4, `${k}_id`, `${k}_table`),
    edge(k, 5, `${k}_parse`, `${k}_chunk`),
    edge(k, 6, `${k}_chunk`, `${k}_embed`),
    edge(k, 7, `${k}_embed`, `${k}_index`),
    edge(k, 8, `${k}_table`, `${k}_entity`),
    edge(k, 9, `${k}_entity`, `${k}_canon`),
    edge(k, 10, `${k}_canon`, `${k}_dedup`),
    edge(k, 11, `${k}_dedup`, `${k}_rel`),
    edge(k, 12, `${k}_index`, `${k}_vec`),
    edge(k, 13, `${k}_rel`, `${k}_query`),
    edge(k, 14, `${k}_vec`, `${k}_query`),
    edge(k, 15, `${k}_query`, `${k}_rerank`),
    edge(k, 16, `${k}_rerank`, `${k}_list`),
    edge(k, 17, `${k}_list`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Formula database",
    description: "Ingredients and formulas from PDFs and sheets, one clean name each.",
    nodes,
    edges,
    tuning: { ...DEFAULT_TUNING, growth: 30 },
  };
}

// ----------------------------------------------------------------------------
// 5. Single-speaker meeting log — audio in, transcribe, chunk/embed, ordered
//    over time, into an episodic memory store.
// ----------------------------------------------------------------------------
function meetingLog(): Template {
  const k = "meeting";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_audio`, "src-audio", 0),
    node(`${k}_id`, "id-identify", 0),
    node(`${k}_trans`, "rd-transcribe", 0),
    node(`${k}_chunk`, "se-chunk", 0, "paragraph"),
    node(`${k}_embed`, "se-embed", 0),
    node(`${k}_index`, "se-index", 0),
    node(`${k}_episodic`, "st-episodic", 0),
    node(`${k}_time`, "st-timeline", 1),
    node(`${k}_query`, "qo-query", 0),
    node(`${k}_list`, "qo-list", 0),
    node(`${k}_rag`, "rag-rag", 0),
  ];
  const edges: Edge[] = [
    ...chain(
      [`${k}_audio`, `${k}_id`, `${k}_trans`, `${k}_chunk`, `${k}_embed`, `${k}_index`],
      k
    ),
    edge(k, 1, `${k}_index`, `${k}_episodic`),
    edge(k, 2, `${k}_trans`, `${k}_time`),
    edge(k, 3, `${k}_episodic`, `${k}_query`),
    edge(k, 4, `${k}_time`, `${k}_query`),
    edge(k, 5, `${k}_query`, `${k}_list`),
    edge(k, 6, `${k}_list`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Single-speaker meeting log",
    description: "One voice, transcribed and kept in order so you can ask what was said when.",
    nodes,
    edges,
    tuning: { ...DEFAULT_TUNING, chunkStrategy: "naive", growth: 10 },
  };
}

// ----------------------------------------------------------------------------
// 6. Legal logic query — PDFs, parse + OCR, entities + relationships into a
//    hypergraph (n-ary facts), graph-style retrieval with rerank.
// ----------------------------------------------------------------------------
function legalLogic(): Template {
  const k = "legal";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_pdf`, "src-pdf", 0),
    node(`${k}_id`, "id-identify", 0),
    node(`${k}_parse`, "rd-parse", 0),
    node(`${k}_ocr`, "rd-ocr", 1),
    node(`${k}_chunk`, "se-chunk", 0, "contextual"),
    node(`${k}_embed`, "se-embed", 0),
    node(`${k}_index`, "se-index", 0),
    node(`${k}_entity`, "rs-entity", 1),
    node(`${k}_rel`, "rs-relationship", 2),
    node(`${k}_canon`, "rs-canonical", 3),
    node(`${k}_hyper`, "st-hypergraph", 0),
    node(`${k}_query`, "qo-query", 0, "semantic"),
    node(`${k}_rerank`, "qo-rerank", 1),
    node(`${k}_render`, "qo-render", 0),
    node(`${k}_rag`, "rag-hyper", 0),
  ];
  const edges: Edge[] = [
    edge(k, 1, `${k}_pdf`, `${k}_id`),
    edge(k, 2, `${k}_id`, `${k}_parse`),
    edge(k, 3, `${k}_id`, `${k}_ocr`),
    edge(k, 4, `${k}_parse`, `${k}_chunk`),
    edge(k, 5, `${k}_ocr`, `${k}_chunk`),
    edge(k, 6, `${k}_chunk`, `${k}_embed`),
    edge(k, 7, `${k}_embed`, `${k}_index`),
    edge(k, 8, `${k}_parse`, `${k}_entity`),
    edge(k, 9, `${k}_entity`, `${k}_rel`),
    edge(k, 10, `${k}_rel`, `${k}_canon`),
    edge(k, 11, `${k}_rel`, `${k}_hyper`),
    edge(k, 12, `${k}_index`, `${k}_query`),
    edge(k, 13, `${k}_hyper`, `${k}_query`),
    edge(k, 14, `${k}_query`, `${k}_rerank`),
    edge(k, 15, `${k}_rerank`, `${k}_render`),
    edge(k, 16, `${k}_render`, `${k}_rag`),
  ];
  return {
    key: k,
    name: "Legal logic query",
    description: "Contracts and rulings as linked n-ary facts, for multi-hop questions.",
    nodes,
    edges,
    tuning: { ...DEFAULT_TUNING, chunkSize: 1024, overlap: 20, growth: 50 },
  };
}

// ----------------------------------------------------------------------------
// 7. Enterprise unified knowledge base — every source, every read track,
//    all stores, all-in-one multimodal RAG. Mature, high growth.
// ----------------------------------------------------------------------------
function enterpriseKB(): Template {
  const k = "enterprise";
  const nodes: Node<PieceNodeData>[] = [
    node(`${k}_file`, "src-file", 0),
    node(`${k}_pdf`, "src-pdf", 1),
    node(`${k}_photo`, "src-photo", 2),
    node(`${k}_audio`, "src-audio", 3),
    node(`${k}_video`, "src-video", 4),
    node(`${k}_web`, "src-web", 5),
    node(`${k}_sheet`, "src-sheet", 6),
    node(`${k}_id`, "id-identify", 2),
    node(`${k}_mm`, "id-multimodal", 3),
    node(`${k}_parse`, "rd-parse", 0),
    node(`${k}_vision`, "rd-vision", 1),
    node(`${k}_ocr`, "rd-ocr", 2),
    node(`${k}_trans`, "rd-transcribe", 3),
    node(`${k}_freeze`, "rd-freeze", 4),
    node(`${k}_table`, "rd-extract-table", 5),
    node(`${k}_chunk`, "se-chunk", 2),
    node(`${k}_embed`, "se-embed", 2),
    node(`${k}_index`, "se-index", 2),
    node(`${k}_entity`, "rs-entity", 0),
    node(`${k}_rel`, "rs-relationship", 1),
    node(`${k}_canon`, "rs-canonical", 2),
    node(`${k}_dedup`, "rs-dedup", 3),
    node(`${k}_norm`, "rs-normalize", 4),
    node(`${k}_vec`, "st-vector", 0),
    node(`${k}_rel2`, "st-relational", 1),
    node(`${k}_hyper`, "st-hypergraph", 2),
    node(`${k}_sem`, "st-semantic", 3),
    node(`${k}_epi`, "st-episodic", 4),
    node(`${k}_query`, "qo-query", 1),
    node(`${k}_rerank`, "qo-rerank", 0),
    node(`${k}_dash`, "qo-dashboard", 2),
    node(`${k}_rag`, "rag-anything", 2),
  ];
  const e: Edge[] = [];
  let c = 0;
  const add = (s: string, t: string) => e.push(edge(k, c++, s, t));
  // all sources -> identify -> multimodal router
  ["file", "pdf", "photo", "audio", "video", "web", "sheet"].forEach((s) =>
    add(`${k}_${s}`, `${k}_id`)
  );
  add(`${k}_id`, `${k}_mm`);
  // router -> read tracks
  ["parse", "vision", "ocr", "trans", "freeze", "table"].forEach((r) =>
    add(`${k}_mm`, `${k}_${r}`)
  );
  // read tracks -> chunk (text-bearing) and -> entity (structured)
  ["parse", "vision", "ocr", "trans"].forEach((r) => add(`${k}_${r}`, `${k}_chunk`));
  ["table", "parse"].forEach((r) => add(`${k}_${r}`, `${k}_entity`));
  add(`${k}_freeze`, `${k}_vision`);
  // searchable chain
  add(`${k}_chunk`, `${k}_embed`);
  add(`${k}_embed`, `${k}_index`);
  // resolve chain
  add(`${k}_entity`, `${k}_rel`);
  add(`${k}_rel`, `${k}_canon`);
  add(`${k}_canon`, `${k}_dedup`);
  add(`${k}_dedup`, `${k}_norm`);
  // into stores
  add(`${k}_index`, `${k}_vec`);
  add(`${k}_norm`, `${k}_rel2`);
  add(`${k}_rel`, `${k}_hyper`);
  add(`${k}_chunk`, `${k}_sem`);
  add(`${k}_trans`, `${k}_epi`);
  // stores -> query
  ["vec", "rel2", "hyper", "sem", "epi"].forEach((s) => add(`${k}_${s}`, `${k}_query`));
  add(`${k}_query`, `${k}_rerank`);
  add(`${k}_rerank`, `${k}_dash`);
  add(`${k}_dash`, `${k}_rag`);
  return {
    key: k,
    name: "Enterprise unified knowledge base",
    description: "Every source and store, all-in-one multimodal retrieval across the company.",
    nodes,
    edges: e,
    tuning: { ...DEFAULT_TUNING, embedDims: 3072, growth: 100 },
  };
}

export const TEMPLATES: Template[] = [
  masterPipeline(),
  competitorIntel(),
  salesDashboard(),
  formulaDatabase(),
  meetingLog(),
  legalLogic(),
  enterpriseKB(),
];
