# Architecture and design

whatsoRAG is a **decision helper** for designing data-ingestion and retrieval (RAG) pipelines.
It is deliberately **not a runtime**: there is no live API and no LLM call. Every behaviour is a
pure function over the canvas, hard-coded from extraction best practice, so the tool is fast,
free, and fully local. This document explains the model and cites the research behind it.

## Design principles

1. **Decision helper, not a textbook and not a runtime.** If a feature does not help someone
   decide their ingest / extract / RAG approach, it is out of scope.
2. **Plain English on screen.** Only approved vocabulary appears in the UI; any non-business term
   gets a hover definition. Internal code may stay technical.
3. **Honest about certainty.** Architecture facts are labelled by source confidence. Vendor and
   preprint claims are marked as such, and refuted claims are excluded.

## The pipeline model

Pieces belong to ordered stages:

| Stage | What it does | Example pieces |
|---|---|---|
| Sources | what you feed in | file, pdf, photo, audio, video, web page, spreadsheet |
| Identify | sort each file by what it is | identify, detect language, scan contents, categorize |
| Read | turn a file into text and tables | parse, ocr, vision, transcribe, extract table, freeze frame |
| Make searchable | chunk, embed, index | chunk, overlap, embed, vectorize, index, summary tree |
| Resolve | dedup, merge, label, relate | dedup, normalize, entity, relationship, canonical, fingerprint, bounding box, flag gaps |
| Stores | where it lands | vector, relational, graph, hypergraph, timeline, episodic, semantic, hierarchy |
| Retrieve | get the right context for the answer | translate query, embed query, route, path expansion, hops, scoring, rerank |
| Query / RAG | ask, rank, show, and the RAG style | query, rerank, dashboard, RAG, GraphRAG, HypergraphRAG |

Files are routed by **content, not extension**: a scanned PDF goes down the OCR path, a
born-digital PDF down the text path, a video splits into an audio stream and sampled frames.
Multilingual content is detected at intake and handled with multilingual models so everything
lands in one shared search space.

## The brain (pure logic)

- **analyze** turns the canvas + tuning into outcomes, benefits, and illustrative tradeoff meters
  (precision / recall / speed / cost / storage), and flexes them along a time slider.
- **recommend** maps the configuration to a retrieval architecture with reasoning and a confidence
  label. n-ary (many-way) facts trigger HypergraphRAG; entities + relationships or a graph store
  trigger GraphRAG / HippoRAG; long, summary-heavy corpora trigger RAPTOR; visually rich documents
  trigger vision-native; otherwise a hybrid baseline.
- **reality** checks whether the pipeline needs AI or can run on rules, and flags feasibility gaps.
- **cook** mock-runs the pipeline, depicts the resulting stores, and assesses whether it supports
  rolling ingestion (bake as you add) or would need a full re-mix and rebake as data grows.

A simulation harness (`scripts/sim.ts`) runs sample configurations through this logic; it was used
to catch and fix a real bug where entities + relationships were wrongly treated as n-ary.

## Retrieval architectures and sources (2025-2026)

- **RAPTOR** - recursive cluster-and-summarize tree retrieval (Sarthi et al., ICLR 2024).
- **HippoRAG** - knowledge graph + Personalized PageRank, single-step multi-hop (Gutierrez et al.,
  NeurIPS 2024; HippoRAG 2, 2025).
- **HypergraphRAG** - n-ary facts via hyperedges (Luo et al., NeurIPS 2025, arXiv 2503.21322).
- **ColPali** - multi-vector match on page images, no OCR (ICLR 2025, arXiv 2407.01449). Real
  engineering cost at scale (vector inflation, storage, query latency) is noted in-app.
- **LazyGraphRAG** - defers the LLM to query time at vector-RAG index cost (Microsoft Research).
- **HyperTSRAG** - hypergraph retrieval with temporal-spatial scoring for multimodal data
  (preprint; treated as unvalidated).
- **Contextual Retrieval** (Anthropic) and **late chunking** (Jina) inform the chunk strategy.
- **Document parsing** options reflect doc-VLMs (NVIDIA Nemotron Parse, IBM Granite-Docling,
  PaddleOCR-VL) and local parsers (LiteParse), benchmarked on OmniDocBench (CVPR 2025).
- **Embeddings** options reflect Matryoshka models (Google Gemini Embedding) alongside Voyage and
  open-weight options (BGE, nomic, Qwen).

These were gathered from primary papers, lab blogs, and leaderboards, then verified before being
encoded. Where a number is vendor-reported or a source is a preprint, the UI says so.
