"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORIES } from "@/lib/catalog";
import { Term } from "@/components/Term";
import type { PieceNodeData } from "@/store/canvas";

export function PieceNode({ data, selected }: NodeProps) {
  const d = data as PieceNodeData;
  const color = CATEGORIES[d.category as keyof typeof CATEGORIES]?.color ?? "#888";
  const categoryLabel = CATEGORIES[d.category as keyof typeof CATEGORIES]?.label;

  return (
    <div
      className="overflow-hidden rounded-xl border bg-white transition-shadow"
      style={{
        borderColor: selected ? color : "#e5e7eb",
        borderWidth: selected ? 2 : 1,
        boxShadow: selected
          ? `0 0 0 3px ${color}33, 0 4px 12px rgba(15, 23, 42, 0.12)`
          : "0 1px 3px rgba(15, 23, 42, 0.08)",
        width: 160,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: color, width: 8, height: 8, border: "none" }}
      />

      <div
        className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
        style={{ background: color }}
      >
        {categoryLabel}
      </div>

      <div className="px-3 py-2.5">
        <div className="text-sm font-semibold leading-tight text-neutral-800">
          <Term word={d.label}>{d.label}</Term>
        </div>
        {d.choice && (
          <div className="mt-1 text-[11px] leading-tight text-neutral-500">
            <Term word={d.choice}>{d.choice}</Term>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: color, width: 8, height: 8, border: "none" }}
      />
    </div>
  );
}
