"use client";

import { useEffect, useState } from "react";
import {
  Files,
  MagnifyingGlass,
  TextAa,
  Sparkle,
  ArrowsMerge,
  Database,
  FunnelSimple,
  ChatCircleDots,
  Brain,
  X,
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
  retrieve: FunnelSimple,
  query: ChatCircleDots,
  rag: Brain,
};

export function Palette({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
} = {}) {
  const grouped = piecesByCategory();
  const [flows, setFlows] = useState<SavedFlow[]>([]);
  const loadInto = useCanvas((s) => s.loadInto);
  const addPieceTap = useCanvas((s) => s.addPieceTap);

  useEffect(() => {
    setFlows(listFlows());
    const i = setInterval(() => setFlows(listFlows()), 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <aside
      className={[
        // Static left column on desktop; off-canvas slide-in drawer on mobile.
        "absolute inset-y-0 left-0 z-30 flex h-full w-[270px] max-w-[85vw] flex-col overflow-y-auto border-r border-neutral-200 bg-white shadow-xl transition-transform duration-200",
        "md:static md:z-auto md:max-w-none md:shadow-none md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-start justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-neutral-800">What is possible</div>
          <div className="text-xs text-neutral-500">Tap to add, or drag onto the canvas.</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pieces panel"
            className="-mr-1 rounded-md p-1 text-neutral-500 hover:bg-neutral-100 md:hidden"
          >
            <X size={18} weight="bold" />
          </button>
        )}
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
                    onClick={() => {
                      addPieceTap(p);
                      onClose?.();
                    }}
                    title={p.blurb}
                    className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[13px] text-neutral-800 hover:border-neutral-300 hover:bg-white md:cursor-grab md:active:cursor-grabbing"
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
