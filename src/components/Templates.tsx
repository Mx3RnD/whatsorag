"use client";

import {
  Stack,
  ChartLineUp,
  ChartBar,
  Flask,
  Microphone,
  Scales,
  Buildings,
  type Icon,
} from "@phosphor-icons/react";
import { TEMPLATES } from "@/lib/templates";
import { Term } from "@/components/Term";
import { useCanvas } from "@/store/canvas";

const ICONS: Record<string, Icon> = {
  master: Stack,
  competitor: ChartLineUp,
  sales: ChartBar,
  formula: Flask,
  meeting: Microphone,
  legal: Scales,
  enterprise: Buildings,
};

export function Templates() {
  const loadInto = useCanvas((s) => s.loadInto);

  return (
    <div className="flex flex-col">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        Starter templates
      </div>
      <div className="flex flex-col gap-1.5">
        {TEMPLATES.map((t) => {
          const IconCmp = ICONS[t.key] ?? Stack;
          return (
            <button
              key={t.key}
              onClick={() => loadInto(t.nodes, t.edges, t.tuning)}
              title={t.description}
              className="group flex items-start gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-left hover:border-neutral-300 hover:bg-white"
            >
              <IconCmp
                size={16}
                weight="bold"
                className="mt-0.5 shrink-0 text-neutral-500 group-hover:text-neutral-700"
              />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-neutral-800">
                  <Term word={t.name}>{t.name}</Term>
                </span>
                <span className="block text-[11px] leading-snug text-neutral-500">
                  {t.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
