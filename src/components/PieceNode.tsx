"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORIES } from "@/lib/catalog";
import { Term } from "@/components/Term";
import { useCanvas, type PieceNodeData } from "@/store/canvas";

export function PieceNode({ id, data, selected }: NodeProps) {
  const d = data as PieceNodeData;
  const color = CATEGORIES[d.category as keyof typeof CATEGORIES]?.color ?? "#888";
  const categoryLabel = CATEGORIES[d.category as keyof typeof CATEGORIES]?.label;

  const connectSourceId = useCanvas((s) => s.connectSourceId);
  const connectMode = connectSourceId !== null;
  const isSource = connectSourceId === id;

  // In connect mode the active source node gets a full-bleed SOURCE handle (drag
  // from anywhere in it), every other node gets a full-bleed TARGET handle (drop
  // anywhere on it). Both handle types stay mounted so existing edges keep their
  // anchors; only the relevant one is enlarged.
  const fullBleed = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    transform: "none",
    borderRadius: 12,
    background: "transparent",
    border: "none",
  };
  const dot = { background: color, width: 8, height: 8, border: "none" };

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-shadow ${
        isSource ? "whatsorag-connect-source" : ""
      }`}
      style={{
        borderColor: selected || isSource ? color : "#e5e7eb",
        borderWidth: selected || isSource ? 2 : 1,
        boxShadow: selected
          ? `0 0 0 3px ${color}33, 0 4px 12px rgba(15, 23, 42, 0.12)`
          : "0 1px 3px rgba(15, 23, 42, 0.08)",
        width: 160,
        // Color the pulse glow to match the piece category.
        ["--pulse-color" as string]: `${color}66`,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectableEnd
        style={connectMode && !isSource ? { ...fullBleed, zIndex: 5 } : dot}
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
        // In connect mode only the chosen source node may start a connection.
        isConnectableStart={connectMode ? isSource : true}
        style={connectMode && isSource ? { ...fullBleed, zIndex: 6 } : dot}
      />
    </div>
  );
}
