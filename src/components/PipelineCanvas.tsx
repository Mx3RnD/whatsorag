"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { Columns } from "@phosphor-icons/react";
import { PieceNode } from "@/components/PieceNode";
import { useCanvas, type PieceNodeData } from "@/store/canvas";
import { getPiece, CATEGORIES } from "@/lib/catalog";
import { arrangeInStages, STAGE_ORDER, STAGE_LABELS } from "@/lib/layout";

const nodeTypes: NodeTypes = { piece: PieceNode };

function Inner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addPiece, select } = useCanvas();
  const { screenToFlowPosition, setNodes, fitView } = useReactFlow<Node<PieceNodeData>>();

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("application/whatsorag");
      const piece = getPiece(id);
      if (!piece) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addPiece(piece, position);
    },
    [screenToFlowPosition, addPiece]
  );

  const onArrange = useCallback(() => {
    setNodes((current) => arrangeInStages(current));
    // Re-fit after positions update so the staged layout is fully in view.
    window.requestAnimationFrame(() => fitView({ duration: 300, padding: 0.15 }));
  }, [setNodes, fitView]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => select(n.id)}
        onPaneClick={() => select(null)}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        fitView
        defaultEdgeOptions={{ animated: true, style: { stroke: "#94a3b8", strokeWidth: 2 } }}
      >
        <Background color="#dbe1e8" gap={18} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => CATEGORIES[(n.data as { category: keyof typeof CATEGORIES }).category]?.color ?? "#888"}
        />

        <Panel position="top-right">
          <button
            type="button"
            onClick={onArrange}
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            <Columns size={16} weight="bold" />
            Arrange in stages
          </button>
        </Panel>

        <Panel position="top-left">
          <div className="flex gap-1.5">
            {STAGE_ORDER.map((key) => {
              const color = CATEGORIES[key].color;
              return (
                <div
                  key={key}
                  className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95"
                  style={{ background: color, opacity: 0.72 }}
                >
                  {STAGE_LABELS[key]}
                </div>
              );
            })}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function PipelineCanvas() {
  const nodeCount = useCanvas((s) => s.nodes.length);
  return (
    <div className="relative h-full w-full">
      <ReactFlowProvider>
        <Inner />
      </ReactFlowProvider>
      {nodeCount === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white/70 px-5 py-4 text-center text-sm text-neutral-500">
            Drag pieces from the left to start building your pipeline.
            <br />
            Connect them by dragging from one edge to another.
          </div>
        </div>
      )}
    </div>
  );
}
