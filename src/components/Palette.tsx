"use client";

import { useEffect, useState } from "react";
import {
  Files,
  MagnifyingGlass,
  TextAa,
  Sparkle,
  ArrowsMerge,
  Database,
  ChatCircleDots,
  Brain,
  type Icon,
} from "@phosphor-icons/react";
import { CATEGORIES, piecesByCategory, type CategoryKey } from "@/lib/catalog";
import { Term } from "@/components/Term";
import { listFlows, type SavedFlow } from "@/lib/persist";
import { useCanvas } from "@/store/canvas";

const CAT_ICON: Record<CategoryKey, Icon> = {
  source: Files,
  identify: MagnifyingGlass,
  read: TextAa,
  searchable: Sparkle,
  resolve: ArrowsMerge,
  store: Database,
  query: ChatCircleDots,
  rag: Brain,
};

export function Palette() {
  const grouped = piecesByCategory();
  const [flows, setFlows] = useState<SavedFlow[]>([]);
  const loadInto = useCanvas((s) => s.loadInto);

  useEffect(() => {
    setFlows(listFlows());
    const i = setInterval(() => setFlows(listFlows()), 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <aside className="flex h-full w-[270px] flex-col overflow-y-auto border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="text-sm font-semibold text-neutral-800">What is possible</div>
        <div className="text-xs text-neutral-500">Drag a piece onto the canvas.</div>
      </div>

      <div className="flex-1 px-3 py-3">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
          const cat = CATEGORIES[key];
          const IconCmp = CAT_ICON[key];
          return (
            <div key={key} className="mb-4">
              <div className="mb-1.5 flex items-center gap-1.5">
                <IconCmp size={15} weight="bold" color={cat.color} />
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: cat.color }}>
                  {cat.label}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {grouped[key].map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/whatsorag", p.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    title={p.blurb}
                    className="cursor-grab rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[13px] text-neutral-800 hover:border-neutral-300 hover:bg-white active:cursor-grabbing"
                    style={{ borderLeft: `3px solid ${cat.color}` }}
                  >
                    <Term word={p.label}>{p.label}</Term>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {flows.length > 0 && (
        <div className="border-t border-neutral-200 px-3 py-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Saved</div>
          <div className="flex flex-col gap-1">
            {flows.map((f) => (
              <button
                key={f.id}
                onClick={() => loadInto(f.nodes, f.edges, f.tuning)}
                className="truncate rounded-md px-2 py-1 text-left text-[13px] text-neutral-700 hover:bg-neutral-100"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-400">
        Made by Meagan McKeever
      </div>
    </aside>
  );
}
