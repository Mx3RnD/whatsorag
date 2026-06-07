"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { PieceNode } from "@/components/PieceNode";
import { useCanvas } from "@/store/canvas";
import { getPiece, CATEGORIES } from "@/lib/catalog";

const nodeTypes: NodeTypes = { piece: PieceNode };

function Inner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addPiece, select } = useCanvas();
  const { screenToFlowPosition } = useReactFlow();

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
