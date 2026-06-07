"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORIES } from "@/lib/catalog";
import type { PieceNodeData } from "@/store/canvas";

export function PieceNode({ data, selected }: NodeProps) {
  const d = data as PieceNodeData;
  const color = CATEGORIES[d.category as keyof typeof CATEGORIES]?.color ?? "#888";
  return (
    <div
      className="rounded-lg border bg-white shadow-sm"
      style={{
        borderColor: color,
        borderWidth: selected ? 2 : 1,
        boxShadow: selected ? `0 0 0 3px ${color}33` : undefined,
        minWidth: 150,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="rounded-t-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white" style={{ background: color }}>
        {CATEGORIES[d.category as keyof typeof CATEGORIES]?.label}
      </div>
      <div className="px-3 py-2">
        <div className="text-sm font-semibold text-neutral-800">{d.label}</div>
        {d.choice && <div className="mt-0.5 text-[11px] text-neutral-500">{d.choice}</div>}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}
