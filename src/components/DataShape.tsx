"use client";

import { useMemo, useState } from "react";
import {
  Shapes,
  FileText,
  FilePdf,
  Image as ImageIcon,
  Microphone,
  VideoCamera,
  Table,
  Translate,
  UsersThree,
  Quotes,
  Stack,
  ArrowsClockwise,
  Sliders,
  Lightning,
  type Icon,
} from "@phosphor-icons/react";
import { useCanvas } from "@/store/canvas";
import { getPiece } from "@/lib/catalog";
import { Term } from "@/components/Term";
import {
  type DataShape as Shape,
  type Modality,
  DEFAULT_SHAPE,
  recommendPieceIds,
  buildGraph,
  buildTuning,
  shapeMeters,
} from "@/lib/datashape";

const MODALITIES: { key: Modality; label: string; icon: Icon }[] = [
  { key: "text", label: "Text", icon: FileText },
  { key: "pdf", label: "PDF", icon: FilePdf },
  { key: "photo", label: "Photo", icon: ImageIcon },
  { key: "audio", label: "Audio", icon: Microphone },
  { key: "video", label: "Video", icon: VideoCamera },
];

// One-line "why this characteristic matters" hints shown under each toggle group.
const FEATURES: {
  key: keyof Pick<
    Shape,
    "hasTables" | "multilingual" | "multiSpeaker" | "needProvenance"
  >;
  label: string;
  hint: string;
  icon: Icon;
}[] = [
  { key: "hasTables", label: "Has tables", hint: "Keep tables as tables so numbers stay intact.", icon: Table },
  { key: "multilingual", label: "Multilingual", hint: "More than one language in the mix.", icon: Translate },
  { key: "multiSpeaker", label: "Multiple speakers", hint: "Audio where who-said-what matters.", icon: UsersThree },
  { key: "needProvenance", label: "Need citations", hint: "Every answer carries a source trail.", icon: Quotes },
];

function SectionHeader({ icon: Icn, children }: { icon: Icon; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
      <Icn size={14} weight="bold" /> {children}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  icon: Icn,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: Icon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-neutral-800 bg-neutral-800 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      {Icn && <Icn size={14} weight="bold" />}
      {children}
    </button>
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
        <div className="h-2 rounded transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function DataShape() {
  const loadInto = useCanvas((s) => s.loadInto);
  const [shape, setShape] = useState<Shape>(DEFAULT_SHAPE);

  const ids = useMemo(() => recommendPieceIds(shape), [shape]);
  const meters = useMemo(() => shapeMeters(shape), [shape]);
  const tuning = useMemo(() => buildTuning(shape), [shape]);

  const toggleModality = (m: Modality) =>
    setShape((s) => {
      const has = s.modalities.includes(m);
      const next = has ? s.modalities.filter((x) => x !== m) : [...s.modalities, m];
      // Never let the set go empty: text is the floor.
      return { ...s, modalities: next.length ? next : (["text"] as Modality[]) };
    });

  const toggleFlag = (k: typeof FEATURES[number]["key"]) =>
    setShape((s) => ({ ...s, [k]: !s[k] }));

  const apply = () => {
    const { nodes, edges } = buildGraph(ids);
    loadInto(nodes, edges, tuning);
  };

  // Group the recommended piece labels for a quick readback of the combo.
  const recLabels = ids
    .map((id) => getPiece(id)?.label)
    .filter((x): x is string => Boolean(x));

  return (
    <div className="flex flex-col gap-4">
      {/* Intro */}
      <div>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
          <Shapes size={16} weight="bold" /> The shape of your data
        </div>
        <p className="mt-1 text-[12px] leading-snug text-neutral-500">
          Pick what your data looks like. See the tradeoffs move, then drop a recommended
          pipeline onto the canvas to edit.
        </p>
      </div>

      {/* Modalities */}
      <div>
        <SectionHeader icon={Stack}>What kind of files</SectionHeader>
        <div className="flex flex-wrap gap-1.5">
          {MODALITIES.map((m) => (
            <Toggle
              key={m.key}
              icon={m.icon}
              active={shape.modalities.includes(m.key)}
              onClick={() => toggleModality(m.key)}
            >
              {m.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Feature flags */}
      <div>
        <SectionHeader icon={Sliders}>Characteristics</SectionHeader>
        <div className="flex flex-wrap gap-1.5">
          {FEATURES.map((f) => (
            <Toggle
              key={f.key}
              icon={f.icon}
              active={Boolean(shape[f.key])}
              onClick={() => toggleFlag(f.key)}
            >
              <Term word={f.label}>{f.label}</Term>
            </Toggle>
          ))}
        </div>
      </div>

      {/* Schema: 2-way choice */}
      <div>
        <SectionHeader icon={Table}>Schema</SectionHeader>
        <div className="flex gap-1.5">
          {(
            [
              { v: "defined", label: "Defined fields", hint: "You already know the columns." },
              { v: "undefined", label: "Open / discovery", hint: "Let new facts and links emerge." },
            ] as const
          ).map((o) => (
            <Toggle
              key={o.v}
              active={shape.schema === o.v}
              onClick={() => setShape((s) => ({ ...s, schema: o.v }))}
            >
              {o.label}
            </Toggle>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          {shape.schema === "defined"
            ? "Maps to a relational database. Tidy and fast."
            : "Builds a graph / hypergraph for open discovery. More recall, more cost."}
        </p>
      </div>

      {/* Cadence: 2-way choice */}
      <div>
        <SectionHeader icon={ArrowsClockwise}>How it arrives</SectionHeader>
        <div className="flex gap-1.5">
          {(
            [
              { v: "batch", label: "Big batch once", hint: "Load it all up front." },
              { v: "ongoing", label: "Ongoing", hint: "New data keeps arriving." },
            ] as const
          ).map((o) => (
            <Toggle
              key={o.v}
              active={shape.cadence === o.v}
              onClick={() => setShape((s) => ({ ...s, cadence: o.v }))}
            >
              {o.label}
            </Toggle>
          ))}
        </div>
        {shape.cadence === "ongoing" && (
          <p className="mt-1 text-[11px] text-neutral-500">
            Keeps the timeline and grows over time. Recall climbs, so do cost and storage.
          </p>
        )}
      </div>

      {/* Tradeoffs */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <Lightning size={14} weight="bold" /> Tradeoffs
          </div>
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            illustrative
          </span>
        </div>
        {meters.map((m) => (
          <Bar key={m.label} label={m.label} value={m.value} hint={m.hint} />
        ))}
        <p className="mt-1 text-[10px] text-neutral-400">
          Mock heuristic, not a benchmark. Flip toggles to see them move.
        </p>
      </div>

      {/* Recommended combo readback */}
      <div>
        <SectionHeader icon={Shapes}>Recommended combo</SectionHeader>
        <div className="flex flex-wrap gap-1">
          {recLabels.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[11px] text-neutral-700"
            >
              <Term word={label}>{label}</Term>
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-neutral-500">
          {recLabels.length} pieces, laid out left-to-right by stage.
        </p>
      </div>

      {/* Apply */}
      <button
        type="button"
        onClick={apply}
        className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-800 px-3 py-2 text-[13px] font-semibold text-white hover:bg-neutral-700"
      >
        <Shapes size={16} weight="bold" /> Apply to canvas
      </button>
    </div>
  );
}
