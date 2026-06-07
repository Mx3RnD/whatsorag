// Recommend a retrieval architecture for the current configuration.
// Rule-based, grounded in the research notes (vault: whatsoRAG/Research - *).
// Pure function, no API. Confidence is labelled honestly.

import type { Node } from "@xyflow/react";
import type { PieceNodeData } from "@/store/canvas";

export type Recommendation = {
  architecture: string;
  why: string;
  basis: string[]; // signals detected in the configuration
  alternatives: string[];
  confidence: "high" | "medium" | "preprint";
  baseline: string[]; // always-good additions
};

export function recommend(nodes: Node<PieceNodeData>[]): Recommendation {
  const ids = new Set(nodes.map((n) => n.data.pieceId));
  const has = (id: string) => ids.has(id);

  // signals
  const visual = has("src-photo") || has("src-pdf");
  const audio = has("src-audio");
  const video = has("src-video");
  const multimodal = [has("src-photo"), has("src-audio"), has("src-video"), has("src-pdf")].filter(Boolean).length >= 2 || video;
  const temporal = video || audio || has("st-timeline") || has("st-episodic");
  const spatial = has("src-photo") || video;
  const nAry = has("st-hypergraph") || has("rag-hyper") || has("rs-canonical") || (has("rs-entity") && has("rs-relationship"));
  const graphy = has("rag-graph") || has("rag-hippo") || (has("rs-entity") && has("rs-relationship"));
  // explicit picks
  const pickedRaptor = has("rag-raptor") || has("se-summary-tree");
  const pickedHippo = has("rag-hippo");
  // long-document / summarization-heavy signals
  const sourceKinds = [has("src-pdf"), has("src-photo"), has("src-audio"), has("src-video"), has("src-web"), has("src-sheet"), has("src-file")].filter(Boolean).length;
  const summarizeIntent = has("rd-describe") || has("qo-dashboard") || has("qo-list");
  const longDoc =
    pickedRaptor ||
    (has("src-pdf") && summarizeIntent) ||
    sourceKinds >= 4; // a lot of source types arriving = corpus growth / big-picture need

  const basis: string[] = [];
  if (multimodal) basis.push("multimodal sources (more than one of pdf/photo/audio/video)");
  if (temporal) basis.push("time matters (audio/video or order-aware/episodic store)");
  if (spatial) basis.push("images present (spatial / bounding-box reasoning)");
  if (nAry) basis.push("facts link many entities at once (hypergraph / canonical)");
  else if (graphy) basis.push("entities and relationships (linked facts)");
  if (visual && !multimodal) basis.push("visually rich documents (tables, charts)");
  if (longDoc) basis.push("long documents or summary-heavy questions (big-picture and detail)");
  if (pickedHippo) basis.push("multi-hop questions (knowledge integration across linked facts)");

  const baseline = [
    "Hybrid retrieval: dense (semantic) + keyword (BM25), then rerank.",
    "Contextual or late chunking so passages keep their context.",
    "Matryoshka embeddings so you can trade accuracy for speed/storage.",
    "Keep a source trail (provenance) on every fact for citations.",
  ];

  // priority ladder
  if (multimodal && temporal && nAry) {
    return {
      architecture: "Hypergraph RAG with temporal-spatial scoring (HyperTSRAG-style)",
      why: "Your input is multimodal, time matters, and one fact links many things. A hypergraph holds the n-ary facts; temporal and spatial scoring handles 'when' and 'where' that plain semantic search misses.",
      basis,
      alternatives: ["HypergraphRAG (without time/space scoring)", "Multimodal RAG with ColPali (vision-native)"],
      confidence: "preprint",
      baseline,
    };
  }
  if (pickedHippo) {
    return {
      architecture: "HippoRAG",
      why: "You want to answer multi-part questions that hop across linked facts. HippoRAG builds a knowledge graph and uses Personalized PageRank to do that hop in a single step, which is cheaper than asking the model to retrieve again and again. It is brain-inspired: the graph acts like a memory index.",
      basis,
      alternatives: ["GraphRAG / LightRAG (if you prefer iterative graph traversal)", "HypergraphRAG (if single facts link many entities at once)"],
      confidence: "medium",
      baseline,
    };
  }
  if (nAry) {
    return {
      architecture: "HypergraphRAG",
      why: "One fact links many entities at once (and you keep canonical / also-reported-as). A hypergraph represents that directly, which a plain two-thing graph cannot.",
      basis,
      alternatives: ["GraphRAG (if two-way links are enough)", "HippoRAG (for cheap single-step multi-hop over a graph)", "HypergraphRAG + temporal scoring (if time matters)"],
      confidence: "high",
      baseline,
    };
  }
  if (graphy) {
    return {
      architecture: "GraphRAG (e.g. LightRAG); HippoRAG for single-step multi-hop; LazyGraphRAG if cost-sensitive",
      why: "You are linking entities and relationships, so retrieval that follows links answers multi-part questions better than chunk search alone. HippoRAG does the multi-hop in one Personalized-PageRank step (cheaper than iterative). LazyGraphRAG indexes at vector-RAG cost by deferring the LLM to query time.",
      basis,
      alternatives: ["HippoRAG (cheap single-step multi-hop)", "HypergraphRAG (if facts are n-ary)", "RAPTOR (if questions also need big-picture summaries)", "Plain hybrid RAG (if links are not central)"],
      confidence: "medium",
      baseline,
    };
  }
  if (longDoc) {
    return {
      architecture: "RAPTOR (summary-tree retrieval) + hybrid + rerank",
      why: "Your corpus is long-document and summary-heavy. RAPTOR recursively clusters and summarizes passages into a tree, then retrieves across tree levels, so it can answer both big-picture questions ('what does this report conclude') and detail questions ('what was the exact value') from the same store. Plain chunk search tends to miss the big picture.",
      basis,
      alternatives: ["Plain hybrid RAG (if questions are mostly local/detail)", "GraphRAG (if entities and relationships are central)", "Vision-native (if documents are visually rich)"],
      confidence: "high",
      baseline,
    };
  }
  if (multimodal || (visual && (has("rd-vision") || has("rd-ocr")))) {
    return {
      architecture: "Vision-native multimodal RAG (ColPali / doc-VLM) + hybrid + rerank",
      why: "Your documents are visually rich (pages, tables, charts, images). Matching on page images (ColPali) or parsing with a doc-VLM keeps tables and figures as evidence instead of losing them to text-only extraction. Note ColPali's storage/latency cost at scale.",
      basis,
      alternatives: ["doc-VLM parse to markdown, then plain hybrid RAG", "RAPTOR (if questions need big-picture summaries)", "HypergraphRAG if facts are n-ary"],
      confidence: "high",
      baseline,
    };
  }
  return {
    architecture: "Hybrid RAG: dense + keyword (BM25) + rerank, with contextual chunking",
    why: "Mostly text and semantic search. The strong, simple baseline: hybrid retrieval plus reranking, with contextual chunking, beats naive vector-only and is cheaper than a graph.",
    basis: basis.length ? basis : ["text-first, semantic search"],
    alternatives: ["RAPTOR (if documents are long and questions need the big picture)", "GraphRAG / HippoRAG (if you add entities + relationships)", "Vision-native (if documents are visually rich)"],
    confidence: "high",
    baseline,
  };
}
