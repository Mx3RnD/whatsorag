"use client";

import { useMemo, useState } from "react";
import { FloppyDisk, DownloadSimple, Sliders, Clock, Sparkle, Compass } from "@phosphor-icons/react";
import { useCanvas } from "@/store/canvas";
import { getPiece, getModels } from "@/lib/catalog";
import { getSample } from "@/lib/samples";
import { explainPiece } from "@/lib/explain";
import { analyze } from "@/lib/analyze";
import { recommend } from "@/lib/recommend";
import { Term } from "@/components/Term";
import { saveFlow } from "@/lib/persist";
import { buildSpecMarkdown, downloadMarkdown } from "@/lib/exportSpec";

// Words that have a hover definition in the glossary; wrap them where they appear in
// recommendation text so the user can hover any jargon.
const TERMS = [
  "RAPTOR", "HippoRAG", "HypergraphRAG", "GraphRAG", "LazyGraphRAG", "LightRAG",
  "HyperTSRAG", "ColPali", "BM25", "hybrid", "rerank", "embeddings", "provenance",
  "Personalized PageRank", "hypergraph", "summary tree", "RAG",
];
const TERM_RE = new RegExp(`\\b(${TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

// Render a plain string, wrapping any glossary term in <Term> for hover definitions.
function Glossed({ text }: { text: string }) {
  const parts = text.split(TERM_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Term key={i} word={part}>{part}</Term>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "preprint" }) {
  const styles: Record<string, string> = {
    high: "bg-green-100 text-green-800",
    medium: "bg-amber-100 text-amber-800",
    preprint: "bg-rose-100 text-rose-800",
  };
  const label = level === "preprint" ? "preprint" : `${level} confidence`;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[level]}`}>
      {label}
    </span>
  );
}

function Bar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color = value >= 66 ? "#3A9D3A" : value >= 40 ? "#E08A1E" : "#D6336C";
  return (
    <div className="mb-2" title={hint}>
      <div className="flex justify-between text-[12px] text-neutral-600">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded bg-neutral-200">
        <div className="h-2 rounded" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function OutputPanel() {
  const { nodes, edges, selectedId, tuning, setChoice, setModel, setTuning } = useCanvas();
  const [name, setName] = useState("My pipeline");
  const selected = nodes.find((n) => n.id === selectedId);
  const selectedPiece = selected ? getPiece(selected.data.pieceId) : undefined;
  const a = useMemo(() => analyze(nodes, tuning), [nodes, tuning]);
  const rec = useMemo(() => recommend(nodes), [nodes]);

  return (
    <aside className="flex h-full w-[350px] flex-col overflow-y-auto border-l border-neutral-200 bg-white">
      {/* Save / Export */}
      <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm"
        />
        <button
          onClick={() => saveFlow({ name, nodes, edges, tuning })}
          title="Save this pipeline"
          className="flex items-center gap-1 rounded-md bg-neutral-800 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-700"
        >
          <FloppyDisk size={15} weight="bold" /> Save
        </button>
        <button
          onClick={() => downloadMarkdown(name, buildSpecMarkdown(name, nodes, edges, tuning))}
          title="Export a complete .md spec / build prompt"
          className="flex items-center gap-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50"
        >
          <DownloadSimple size={15} weight="bold" /> Export
        </button>
      </div>

      {/* Recommended retrieval */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          <Compass size={14} weight="bold" /> Recommended retrieval
        </div>
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="text-[13px] font-semibold leading-snug text-neutral-900">
            <Glossed text={rec.architecture} />
          </div>
          <ConfidenceBadge level={rec.confidence} />
        </div>
        <p className="mb-2 text-[12px] leading-snug text-neutral-700">
          <Glossed text={rec.why} />
        </p>

        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Why (from your canvas)</div>
        <ul className="mb-2 list-disc pl-4 text-[12px] text-neutral-700">
          {rec.basis.map((b, i) => (
            <li key={i} className="mb-0.5"><Glossed text={b} /></li>
          ))}
        </ul>

        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Alternatives</div>
        <ul className="mb-2 list-disc pl-4 text-[12px] text-neutral-700">
          {rec.alternatives.map((alt, i) => (
            <li key={i} className="mb-0.5"><Glossed text={alt} /></li>
          ))}
        </ul>

        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Always-good baseline</div>
        <ul className="list-disc pl-4 text-[12px] text-neutral-600">
          {rec.baseline.map((b, i) => (
            <li key={i} className="mb-0.5"><Glossed text={b} /></li>
          ))}
        </ul>
      </div>

      {/* About this piece */}
      {selected && (
        <div className="border-b border-neutral-200 px-4 py-3">
          <div className="text-sm font-semibold text-neutral-800">
            <Term word={selected.data.label}>{selected.data.label}</Term>
          </div>
          {(() => {
            const ex = explainPiece(selected.data.pieceId);
            const what = ex?.what ?? selectedPiece?.blurb;
            return (
              <>
                {what && <p className="mt-1 text-[12px] text-neutral-600">{what}</p>}
                {ex?.when && (
                  <p className="mt-1 text-[12px] text-neutral-500">
                    <span className="font-medium">When:</span> {ex.when}
                  </p>
                )}
                {ex?.vs && (
                  <p className="mt-1 text-[12px] text-neutral-500">
                    <span className="font-medium">Vs others:</span> {ex.vs}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Selected piece config */}
      {selected && selectedPiece?.options && (
        <div className="border-b border-neutral-200 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <Term word={selected.data.label}>{selected.data.label}</Term> — method
          </div>
          <select
            value={selected.data.choice}
            onChange={(e) => setChoice(selected.id, e.target.value)}
            className="mt-1.5 w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm"
          >
            {selectedPiece.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Model picker (LLM-backed pieces) */}
      {selected && getModels(selected.data.pieceId) && (
        <div className="border-b border-neutral-200 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Model</div>
          <select
            value={selected.data.model ?? ""}
            onChange={(e) => setModel(selected.id, e.target.value)}
            className="mt-1.5 w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm"
          >
            {getModels(selected.data.pieceId)!.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="mt-1 text-[10px] text-neutral-400">Open-weight and frontier options.</div>
        </div>
      )}

      {/* Sample output preview */}
      {selected && getSample(selected.data.pieceId) && (
        <div className="border-b border-neutral-200 px-4 py-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Sample output
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-neutral-900 p-3 text-[11px] leading-relaxed text-neutral-100">
{getSample(selected.data.pieceId)!.text}
          </pre>
          <div className="mt-1 text-[10px] text-neutral-400">Illustrative example, not your real data.</div>
        </div>
      )}

      {/* Tuning */}
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          <Sliders size={14} weight="bold" /> Tuning (mock)
        </div>

        <label className="mb-2 block text-[12px] text-neutral-600">
          <Term word="chunk">Chunk</Term> size: {tuning.chunkSize} tokens
          <input type="range" min={128} max={2048} step={32} value={tuning.chunkSize}
            onChange={(e) => setTuning({ chunkSize: +e.target.value })} className="w-full" />
        </label>

        <label className="mb-2 block text-[12px] text-neutral-600">
          <Term word="overlap">Overlap</Term>: {tuning.overlap}%
          <input type="range" min={0} max={40} value={tuning.overlap}
            onChange={(e) => setTuning({ overlap: +e.target.value })} className="w-full" />
        </label>

        <label className="mb-2 block text-[12px] text-neutral-600">
          <Term word="embed">Embed</Term> size: {tuning.embedDims} dims
          <input type="range" min={0} max={3} value={[256, 768, 1536, 3072].indexOf(tuning.embedDims)}
            onChange={(e) => setTuning({ embedDims: [256, 768, 1536, 3072][+e.target.value] })} className="w-full" />
        </label>

        <div className="mb-2 flex items-center gap-2 text-[12px] text-neutral-600">
          <input id="rr" type="checkbox" checked={tuning.rerank} onChange={(e) => setTuning({ rerank: e.target.checked })} />
          <label htmlFor="rr"><Term word="rerank">Rerank</Term></label>
        </div>

        <div className="flex gap-1">
          {(["naive", "contextual", "late"] as const).map((s) => (
            <button key={s} onClick={() => setTuning({ chunkStrategy: s })}
              className={`flex-1 rounded-md border px-1 py-1 text-[11px] ${tuning.chunkStrategy === s ? "border-neutral-800 bg-neutral-800 text-white" : "border-neutral-300 text-neutral-700"}`}>
              <Term word={s}>{s}</Term>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          <Clock size={14} weight="bold" /> Over time
        </div>
        <label className="block text-[12px] text-neutral-600">
          {tuning.growth === 0 ? "Day one" : tuning.growth >= 90 ? "Mature" : `Growing (${tuning.growth}%)`}
          <input type="range" min={0} max={100} value={tuning.growth}
            onChange={(e) => setTuning({ growth: +e.target.value })} className="w-full" />
        </label>
        <div className="text-[11px] text-neutral-500">
          Slide forward: more doc types and sources arrive. Recall grows, cost and storage grow, outcomes expand.
        </div>
      </div>

      {/* Meters */}
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Effect on the output</div>
        {a.meters.map((m) => (
          <Bar key={m.label} label={m.label} value={m.value} hint={m.hint} />
        ))}
      </div>

      {/* Outcomes + benefits */}
      <div className="px-4 py-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          <Sparkle size={14} weight="bold" /> What you get
        </div>
        <ul className="mb-3 list-disc pl-4 text-[12px] text-neutral-700">
          {a.outcomes.map((o, i) => <li key={i} className="mb-1">{o}</li>)}
        </ul>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Benefits</div>
        <ul className="list-disc pl-4 text-[12px] text-neutral-700">
          {a.benefits.map((b, i) => <li key={i} className="mb-1">{b}</li>)}
        </ul>
        <div className="mt-3 rounded-md bg-neutral-100 px-3 py-2 text-[12px] text-neutral-600">{a.unify}</div>
      </div>
    </aside>
  );
}
