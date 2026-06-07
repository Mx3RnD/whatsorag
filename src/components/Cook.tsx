"use client";

// "Cook": press the button, mock-run the pipeline, and SEE what you end up with.
// A clean picture per store, a "works now" badge, and an "over time" mini chart
// that shows recall / cost / storage rising as data grows. No API, all from cook().

import { useState } from "react";
import {
  CookingPot,
  Pulse,
  TrendUp,
  CheckCircle,
  WarningCircle,
  Lightning,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useCanvas } from "@/store/canvas";
import { Term } from "@/components/Term";
import {
  cook,
  type CookResult,
  type CookedStore,
  type Snapshot,
} from "@/lib/cook";

export function Cook() {
  const nodes = useCanvas((s) => s.nodes);
  const edges = useCanvas((s) => s.edges);
  const tuning = useCanvas((s) => s.tuning);
  const [result, setResult] = useState<CookResult | null>(null);

  const runCook = () => setResult(cook(nodes, edges, tuning));

  return (
    <section className="flex flex-col gap-4 text-neutral-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CookingPot size={22} weight="duotone" className="text-amber-400" />
          <div>
            <h2 className="text-sm font-semibold">Cook</h2>
            <p className="text-xs text-neutral-400">
              Run it in your head: see what you end up with, and whether it keeps
              working as data grows.
            </p>
          </div>
        </div>
        <button
          onClick={runCook}
          className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-amber-400"
        >
          <CookingPot size={15} weight="bold" />
          Cook
        </button>
      </header>

      {!result ? (
        <Idle />
      ) : !result.hasStore ? (
        <EmptyState reason={result.emptyReason} />
      ) : (
        <div className="flex flex-col gap-5">
          <WhatYouGet stores={result.stores} />
          <WorksNow worksNow={result.worksNow} />
          <OverTime snaps={result.overTime} verdict={result.verdictOverTime} />
        </div>
      )}
    </section>
  );
}

/* ----------------------------- states ----------------------------- */

function Idle() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-6 text-center text-xs text-neutral-400">
      Press <span className="font-semibold text-neutral-200">Cook</span> to
      mock-run the pipeline and see the result.
    </div>
  );
}

function EmptyState({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-6 text-center">
      <p className="text-sm font-medium text-neutral-200">Add a store, then cook</p>
      <p className="mt-1 text-xs text-neutral-400">{reason}</p>
    </div>
  );
}

/* -------------------------- what you get -------------------------- */

function WhatYouGet({ stores }: { stores: CookedStore[] }) {
  return (
    <div>
      <SectionLabel icon={<TrendUp size={15} weight="bold" />}>
        What you end up with
      </SectionLabel>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stores.map((s) => (
          <StoreCard key={s.pieceId} store={s} />
        ))}
      </div>
    </div>
  );
}

function StoreCard({ store }: { store: CookedStore }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: store.color }}
        />
        <span className="text-xs font-semibold text-neutral-100">
          <Term word={store.term}>{store.label}</Term>
        </span>
      </div>
      <div className="mt-2 flex items-center justify-center">
        <StoreGlyph store={store} />
      </div>
      <p className="mt-1 text-center text-[11px] text-neutral-400">
        {storeCaption(store)}
      </p>
    </div>
  );
}

function storeCaption(s: CookedStore): string {
  switch (s.kind) {
    case "vector":
      return `~${s.points} fingerprints`;
    case "semantic":
      return `~${s.points} meanings`;
    case "relational":
      return `~${s.rows} rows x ${s.cols} cols`;
    case "graph":
      return `~${s.nodes} things, ${s.links} links`;
    case "hypergraph":
      return `~${s.nodes} things, ${s.facts} n-ary facts`;
    case "timeline":
      return `~${s.events} events in order`;
    case "episodic":
      return `~${s.events} events over time`;
    case "hierarchy":
      return `~${s.nodes} nodes, ${s.levels} levels`;
    default:
      return "";
  }
}

/* ------------------------- store glyphs (SVG) ------------------------- */

const GW = 140;
const GH = 100;

function StoreGlyph({ store }: { store: CookedStore }) {
  const c = store.color;
  switch (store.kind) {
    case "vector":
    case "semantic":
      return <VectorGlyph color={c} labelled={store.kind === "semantic"} />;
    case "relational":
      return <RelationalGlyph color={c} />;
    case "graph":
      return <GraphGlyph color={c} />;
    case "hypergraph":
      return <HyperGlyph color={c} />;
    case "timeline":
      return <TimelineGlyph color={c} />;
    case "episodic":
      return <EpisodicGlyph color={c} />;
    case "hierarchy":
      return <HierarchyGlyph color={c} />;
    default:
      return null;
  }
}

function svgProps() {
  return {
    width: GW,
    height: GH,
    viewBox: `0 0 ${GW} ${GH}`,
    role: "img" as const,
  };
}

// deterministic dot positions (a tidy scattered cluster)
const DOTS: [number, number][] = [
  [28, 30], [52, 22], [74, 34], [98, 26], [114, 44],
  [20, 56], [44, 50], [66, 58], [88, 52], [108, 66],
  [34, 74], [58, 78], [80, 72], [100, 84], [48, 36],
];

function VectorGlyph({ color, labelled }: { color: string; labelled?: boolean }) {
  return (
    <svg {...svgProps()} aria-label="cluster of points by meaning">
      {labelled && (
        <>
          <ellipse cx={56} cy={44} rx={42} ry={28} fill={color} opacity={0.08} />
          <ellipse cx={92} cy={62} rx={34} ry={24} fill={color} opacity={0.08} />
        </>
      )}
      {DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill={color} opacity={0.85} />
      ))}
      {labelled && (
        <>
          <text x={56} y={20} textAnchor="middle" fontSize={7} fill={color}>
            meaning
          </text>
          <text x={104} y={90} textAnchor="middle" fontSize={7} fill={color}>
            related
          </text>
        </>
      )}
    </svg>
  );
}

function RelationalGlyph({ color }: { color: string }) {
  const cols = [22, 64, 106];
  const rows = [30, 46, 62, 78];
  return (
    <svg {...svgProps()} aria-label="rows and columns table">
      <rect x={14} y={18} width={112} height={70} rx={4} fill="none" stroke={color} strokeWidth={1.4} opacity={0.6} />
      <rect x={14} y={18} width={112} height={14} rx={4} fill={color} opacity={0.18} />
      {cols.slice(1).map((x, i) => (
        <line key={i} x1={x - 12} y1={18} x2={x - 12} y2={88} stroke={color} strokeWidth={1} opacity={0.35} />
      ))}
      {rows.map((y) =>
        cols.map((x, j) => (
          <rect key={`${y}-${j}`} x={x - 8} y={y - 3} width={16} height={5} rx={2} fill={color} opacity={y === 30 ? 0.75 : 0.4} />
        )),
      )}
    </svg>
  );
}

function GraphGlyph({ color }: { color: string }) {
  const N: [number, number][] = [
    [30, 30], [105, 26], [70, 56], [26, 78], [110, 78],
  ];
  const L: [number, number][] = [
    [0, 2], [1, 2], [2, 3], [2, 4], [0, 3], [1, 4],
  ];
  return (
    <svg {...svgProps()} aria-label="things joined by links">
      {L.map(([a, b], i) => (
        <line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} stroke={color} strokeWidth={1.3} opacity={0.45} />
      ))}
      {N.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} fill={color} opacity={0.85} />
      ))}
    </svg>
  );
}

function HyperGlyph({ color }: { color: string }) {
  // overlapping rounded blobs, each grouping several dots = one n-ary fact
  const blobs = [
    { x: 18, y: 24, w: 70, h: 44 },
    { x: 54, y: 44, w: 70, h: 44 },
    { x: 36, y: 14, w: 60, h: 40 },
  ];
  const dots: [number, number][] = [
    [40, 40], [60, 34], [78, 46], [54, 60], [90, 62], [30, 50], [72, 72],
  ];
  return (
    <svg {...svgProps()} aria-label="one fact linking many things at once">
      {blobs.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} fill={color} opacity={0.12} stroke={color} strokeOpacity={0.4} strokeWidth={1} />
      ))}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.6} fill={color} opacity={0.9} />
      ))}
    </svg>
  );
}

function TimelineGlyph({ color }: { color: string }) {
  const bars = [26, 38, 34, 52, 48, 64, 72];
  const bw = 12;
  const gap = 5;
  const baseY = 86;
  return (
    <svg {...svgProps()} aria-label="ascending bars over time">
      <line x1={12} y1={baseY} x2={128} y2={baseY} stroke={color} strokeWidth={1} opacity={0.5} />
      {bars.map((h, i) => {
        const x = 16 + i * (bw + gap);
        return <rect key={i} x={x} y={baseY - h} width={bw} height={h} rx={2} fill={color} opacity={0.8} />;
      })}
    </svg>
  );
}

function EpisodicGlyph({ color }: { color: string }) {
  // stacked time rows: a dot (the event) + a bar (what happened)
  const rows = [22, 40, 58, 76];
  return (
    <svg {...svgProps()} aria-label="events stacked over time">
      {rows.map((y, i) => (
        <g key={i}>
          <circle cx={20} cy={y} r={4} fill={color} opacity={0.85} />
          <rect x={32} y={y - 4} width={86 - i * 12} height={8} rx={4} fill={color} opacity={0.35} />
          {i < rows.length - 1 && (
            <line x1={20} y1={y + 5} x2={20} y2={rows[i + 1] - 5} stroke={color} strokeWidth={1} opacity={0.4} />
          )}
        </g>
      ))}
    </svg>
  );
}

function HierarchyGlyph({ color }: { color: string }) {
  const root: [number, number] = [70, 22];
  const mid: [number, number][] = [[40, 54], [100, 54]];
  const leaf: [number, number][] = [[24, 84], [56, 84], [84, 84], [116, 84]];
  const edges: [[number, number], [number, number]][] = [
    [root, mid[0]], [root, mid[1]],
    [mid[0], leaf[0]], [mid[0], leaf[1]],
    [mid[1], leaf[2]], [mid[1], leaf[3]],
  ];
  return (
    <svg {...svgProps()} aria-label="a small summary tree">
      {edges.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={1.2} opacity={0.4} />
      ))}
      <circle cx={root[0]} cy={root[1]} r={6.5} fill={color} opacity={0.9} />
      {mid.map(([x, y], i) => (
        <circle key={`m${i}`} cx={x} cy={y} r={5} fill={color} opacity={0.7} />
      ))}
      {leaf.map(([x, y], i) => (
        <rect key={`l${i}`} x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={color} opacity={0.55} />
      ))}
    </svg>
  );
}

/* ----------------------------- works now ----------------------------- */

function WorksNow({
  worksNow,
}: {
  worksNow: CookResult["worksNow"];
}) {
  const ok = worksNow.verdict === "workable";
  return (
    <div>
      <SectionLabel icon={<Pulse size={15} weight="bold" />}>Works now</SectionLabel>
      <div className="mt-2 flex flex-col gap-2">
        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            ok
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {ok ? <CheckCircle size={15} weight="fill" /> : <WarningCircle size={15} weight="fill" />}
          {ok ? "Workable" : "Worth a look"}
        </div>

        {worksNow.issues.length > 0 && (
          <ul className="flex flex-col gap-1 text-xs text-neutral-300">
            {worksNow.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <WarningCircle size={13} weight="bold" className="mt-0.5 shrink-0 text-amber-400" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Lightning size={12} weight="fill" className={worksNow.needsAI ? "text-violet-400" : "text-neutral-500"} />
          {worksNow.needsAI
            ? "Uses AI in some steps. Open-weight models can keep it local."
            : "Runs on rules alone, no AI needed."}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- over time ----------------------------- */

function OverTime({
  snaps,
  verdict,
}: {
  snaps: Snapshot[];
  verdict: string;
}) {
  return (
    <div>
      <SectionLabel icon={<ArrowsClockwise size={15} weight="bold" />}>
        Over time, as data grows
      </SectionLabel>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {snaps.map((s) => (
          <GrowthColumn key={s.stage} snap={s} />
        ))}
      </div>
      <div className="mt-3 flex items-start gap-1.5 rounded-md bg-neutral-900/60 px-3 py-2 text-xs text-neutral-200">
        <TrendUp size={14} weight="bold" className="mt-0.5 shrink-0 text-amber-400" />
        <span>{verdict}</span>
      </div>
      <Legend />
    </div>
  );
}

const HEALTH_STYLE: Record<Snapshot["health"], { dot: string; text: string; label: string }> = {
  healthy: { dot: "bg-emerald-400", text: "text-emerald-300", label: "healthy" },
  strained: { dot: "bg-amber-400", text: "text-amber-300", label: "strained" },
  breaks: { dot: "bg-rose-400", text: "text-rose-300", label: "breaks" },
};

const BARS: { key: keyof Pick<Snapshot, "recall" | "cost" | "storage">; label: string; color: string }[] = [
  { key: "recall", label: "Recall", color: "#34d399" },
  { key: "cost", label: "Cost", color: "#fbbf24" },
  { key: "storage", label: "Storage", color: "#60a5fa" },
];

function GrowthColumn({ snap }: { snap: Snapshot }) {
  const h = HEALTH_STYLE[snap.health];
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5">
      <div className="text-center text-[11px] font-semibold capitalize text-neutral-200">
        {snap.stage}
      </div>
      <div className="mt-2 flex h-20 items-end justify-center gap-2">
        {BARS.map((b) => {
          const v = snap[b.key];
          return (
            <div key={b.key} className="flex h-full flex-col items-center justify-end gap-1">
              <div className="flex h-full w-4 items-end overflow-hidden rounded-sm bg-neutral-800">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{ height: `${v}%`, backgroundColor: b.color }}
                  title={`${b.label}: ${v}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={`mt-2 flex items-center justify-center gap-1 text-[10px] font-medium ${h.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${h.dot}`} />
        {h.label}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-neutral-400">
      {BARS.map((b) => (
        <span key={b.key} className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: b.color }} />
          {b.label}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------- shared ----------------------------- */

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
      <span className="text-neutral-300">{icon}</span>
      {children}
    </div>
  );
}
