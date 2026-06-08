"use client";

import type { ReactNode } from "react";
import {
  Check,
  X,
  Minus,
  type Icon,
} from "@phosphor-icons/react";
import { Term } from "@/components/Term";

type Triple = "yes" | "no" | "partial";

type Row = {
  name: string;
  preprint?: boolean;
  graphType: ReactNode;
  modalities: ReactNode;
  timeAware: Triple;
  spaceAware: Triple;
  retrieves: ReactNode;
  bestFor: ReactNode;
  sourceConfidence: ReactNode;
};

const ROWS: Row[] = [
  {
    name: "Plain RAG",
    graphType: "None (flat passages)",
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Top matches by meaning over <Term word="chunk">chunks</Term>, then the model
        answers.
      </>
    ),
    bestFor: "FAQs, single-document Q&A, fast baselines.",
    sourceConfidence: "Per-chunk score; no cross-fact reasoning.",
  },
  {
    name: "GraphRAG",
    graphType: (
      <>
        Knowledge <Term word="graphrag">graph</Term> (binary edges) + community
        summaries
      </>
    ),
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Builds an <Term word="entity">entity</Term> graph at index time, answers from
        community summaries (global) or local subgraphs.
      </>
    ),
    bestFor: "Whole-corpus, theme-level questions (Microsoft).",
    sourceConfidence: "Traces to communities and source spans.",
  },
  {
    name: "LightRAG",
    graphType: (
      <>
        Knowledge <Term word="graphrag">graph</Term> + dual-level keys
      </>
    ),
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Combines low-level (entity) and high-level (concept) retrieval; supports cheap
        incremental updates.
      </>
    ),
    bestFor: "Graph quality near GraphRAG at lower cost; growing corpora.",
    sourceConfidence: "Cites entities and the passages behind them.",
  },
  {
    name: "LazyGraphRAG",
    graphType: (
      <>
        Knowledge <Term word="graphrag">graph</Term>, built lazily
      </>
    ),
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Defers the heavy model work to query time; index cost is roughly that of plain
        vector RAG (Microsoft).
      </>
    ),
    bestFor: "Big corpora where you want graph-style answers at near vector-RAG index cost; quality win is Microsoft's own benchmark.",
    sourceConfidence: "Grounded at query time on retrieved spans.",
  },
  {
    name: "HippoRAG",
    graphType: (
      <>
        Knowledge <Term word="graphrag">graph</Term> + Personalized PageRank
      </>
    ),
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Single-step multi-hop: runs Personalized PageRank over the graph in one pass to
        gather scattered evidence (OSU, NeurIPS 2024).
      </>
    ),
    bestFor: "Multi-hop questions where evidence is spread across documents.",
    sourceConfidence: "Ranks source passages by graph relevance.",
  },
  {
    name: "RAPTOR",
    graphType: "Recursive cluster-and-summarize tree",
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        Clusters <Term word="chunk">chunks</Term> and summarizes them recursively into a
        tree, then retrieves at the right level of detail (Stanford, ICLR 2024).
      </>
    ),
    bestFor: "Long documents needing both big-picture and fine detail.",
    sourceConfidence: "Cites leaf chunks under each summary node.",
  },
  {
    name: "HypergraphRAG",
    graphType: (
      <>
        <Term word="hypergraph">Hypergraph</Term> (n-ary <Term word="hypergraphrag">hyperedges</Term>)
      </>
    ),
    modalities: "Text",
    timeAware: "no",
    spaceAware: "no",
    retrieves: (
      <>
        One <Term word="hypergraphrag">hyperedge</Term> can join many entities at once, so
        a whole fact is retrieved as a unit (NeurIPS 2025).
      </>
    ),
    bestFor: "Knowledge where facts are inherently n-ary, not just pairs.",
    sourceConfidence: "Cites the full n-ary fact, not fragments.",
  },
  {
    name: "ColPali (vision-native)",
    graphType: "None (page-image embeddings)",
    modalities: "Document images (text, tables, charts, layout)",
    timeAware: "no",
    spaceAware: "partial",
    retrieves: (
      <>
        Embeds and matches directly on page images with late interaction, no{" "}
        <Term word="ocr">OCR</Term> or parsing (ICLR 2025).
      </>
    ),
    bestFor: "Visually rich PDFs: forms, tables, figures, scans. Cost: ~100x more vectors per page (TB-scale storage) and added per-query latency at scale.",
    sourceConfidence: "Points to the exact page region that matched.",
  },
  {
    name: "HyperTSRAG",
    preprint: true,
    graphType: (
      <>
        <Term word="hypergraph">Hypergraph</Term> + temporal-spatial scoring
      </>
    ),
    modalities: (
      <>
        <Term word="multimodal">Multimodal</Term> (text, image, more)
      </>
    ),
    timeAware: "yes",
    spaceAware: "yes",
    retrieves: (
      <>
        Scores n-ary facts with time and place weighting on top of the{" "}
        <Term word="hypergraph">hypergraph</Term>, so when and where a fact holds shapes
        retrieval.
      </>
    ),
    bestFor: "Multimodal knowledge that changes over time and location.",
    sourceConfidence: "Cites the n-ary fact with its time/place context.",
  },
];

function TripleCell({ value }: { value: Triple }) {
  const map: Record<Triple, { Icon: Icon; label: string; cls: string }> = {
    yes: { Icon: Check, label: "Yes", cls: "text-green-600" },
    no: { Icon: X, label: "No", cls: "text-neutral-300" },
    partial: { Icon: Minus, label: "Partial", cls: "text-amber-500" },
  };
  const { Icon: I, label, cls } = map[value];
  return (
    <span className={`inline-flex items-center justify-center ${cls}`} title={label} aria-label={label}>
      <I size={16} weight="bold" />
    </span>
  );
}

const COLS = [
  "Architecture",
  "Graph type",
  "Modalities",
  "Time aware",
  "Space aware",
  "How it retrieves",
  "Best for",
  "Source-confidence",
];

export function ComparisonTable() {
  return (
    <div className="flex flex-col">
      <div className="mb-2">
        <div className="text-sm font-semibold text-neutral-800">
          Retrieval architectures, compared
        </div>
        <div className="text-xs text-neutral-500">
          How the main <Term word="rag">RAG</Term> designs differ, and where each one fits.
        </div>
      </div>

      <div className="mb-1 text-[11px] text-neutral-400 md:hidden">Scroll sideways to see every column &rarr;</div>
      <div className="-mx-1 overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full min-w-[1100px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              {COLS.map((c) => (
                <th
                  key={c}
                  className="border-b border-neutral-200 px-3 py-2 font-semibold align-bottom whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={r.name}
                className={i % 2 === 1 ? "bg-neutral-50/40" : "bg-white"}
              >
                <th
                  scope="row"
                  className="border-b border-neutral-100 px-3 py-2.5 align-top font-semibold text-neutral-800 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {r.name}
                    {r.preprint && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Preprint
                      </span>
                    )}
                  </span>
                </th>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-neutral-700">
                  {r.graphType}
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-neutral-700">
                  {r.modalities}
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-center">
                  <TripleCell value={r.timeAware} />
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-center">
                  <TripleCell value={r.spaceAware} />
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-neutral-600">
                  {r.retrieves}
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-neutral-600">
                  {r.bestFor}
                </td>
                <td className="border-b border-neutral-100 px-3 py-2.5 align-top text-neutral-600">
                  {r.sourceConfidence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <Check size={13} weight="bold" className="text-green-600" /> Yes
        </span>
        <span className="inline-flex items-center gap-1">
          <Minus size={13} weight="bold" className="text-amber-500" /> Partial
        </span>
        <span className="inline-flex items-center gap-1">
          <X size={13} weight="bold" className="text-neutral-300" /> No
        </span>
      </div>
    </div>
  );
}
