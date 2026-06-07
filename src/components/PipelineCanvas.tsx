"use client";

import { useCallback, useState } from "react";
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
import { Columns, ArrowCounterClockwise, Trash } from "@phosphor-icons/react";
import { PieceNode } from "@/components/PieceNode";
import { useCanvas, type PieceNodeData } from "@/store/canvas";
import { getPiece, CATEGORIES } from "@/lib/catalog";
import { arrangeInStages, STAGE_ORDER, STAGE_LABELS } from "@/lib/layout";

const nodeTypes: NodeTypes = { piece: PieceNode };

function Inner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addPiece, select, clear } = useCanvas();
  const { screenToFlowPosition, setNodes, setEdges, fitView } = useReactFlow<Node<PieceNodeData>>();
  const [menu, setMenu] = useState<{ x: number; y: number; kind: "node" | "edge"; id: string } | null>(null);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, n: Node<PieceNodeData>) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, kind: "node", id: n.id });
  }, []);
  const onEdgeContextMenu = useCallback((e: React.MouseEvent, ed: { id: string }) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, kind: "edge", id: ed.id });
  }, []);
  const onDeleteFromMenu = useCallback(() => {
    setMenu((m) => {
      if (!m) return null;
      if (m.kind === "node") {
        setNodes((ns) => ns.filter((n) => n.id !== m.id));
        setEdges((es) => es.filter((e) => e.source !== m.id && e.target !== m.id));
      } else {
        setEdges((es) => es.filter((e) => e.id !== m.id));
      }
      return null;
    });
  }, [setNodes, setEdges]);

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
        deleteKeyCode={["Backspace", "Delete"]}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
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
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onArrange}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <Columns size={16} weight="bold" />
              Arrange in stages
            </button>
            <button
              type="button"
              onClick={() => {
                if (nodes.length === 0 || confirm("Start over? This clears the canvas.")) clear();
              }}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              Start over
            </button>
          </div>
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

      {menu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenu(null);
            }}
          />
          <div
            style={{ position: "fixed", left: menu.x, top: menu.y }}
            className="z-50 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg"
          >
            <button
              type="button"
              onClick={onDeleteFromMenu}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash size={15} weight="bold" />
              Delete {menu.kind === "edge" ? "arrow" : "piece"}
            </button>
          </div>
        </>
      )}
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
