"use client";

import { create } from "zustand";
import {
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { getPiece, getModels, type Piece } from "@/lib/catalog";

export type PieceNodeData = {
  pieceId: string;
  label: string;
  category: string;
  color: string;
  choice?: string; // selected option/method for this node
  model?: string; // selected LLM/model for this node (if model-backed)
  [key: string]: unknown;
};

// Mock tuning knobs (no real effect on data - just illustrates tradeoffs).
export type Tuning = {
  chunkSize: number; // 128..2048 tokens
  overlap: number; // 0..40 %
  embedDims: number; // 256 | 768 | 1536 | 3072 (Matryoshka)
  rerank: boolean;
  chunkStrategy: "naive" | "contextual" | "late";
  growth: number; // 0 (day one) .. 100 (mature): more doc types + sources added over time
};

export const DEFAULT_TUNING: Tuning = {
  chunkSize: 600,
  overlap: 12,
  embedDims: 1536,
  rerank: true,
  chunkStrategy: "contextual",
  growth: 0,
};

type CanvasState = {
  nodes: Node<PieceNodeData>[];
  edges: Edge[];
  selectedId: string | null;
  tuning: Tuning;
  // Bumped whenever the canvas should re-fit the view (tap-add, load). The
  // canvas watches this so taps/loads land in view without a React Flow ref here.
  fitSignal: number;
  // Touch "connect mode": the node you're drawing an arrow FROM. While set, that
  // node pulses, the canvas freezes panning, and a drag anywhere from it to
  // another node makes the connection (no tiny handle to hit). Cleared on connect.
  connectSourceId: string | null;
  onNodesChange: (c: NodeChange[]) => void;
  onEdgesChange: (c: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;
  addPiece: (piece: Piece, position: { x: number; y: number }) => void;
  // Add a piece without a drop position (tap / click), staggered and auto-fit.
  addPieceTap: (piece: Piece) => void;
  // Remove a node and its connected edges (touch-friendly delete; no right-click).
  removeNode: (id: string) => void;
  // Enter/exit connect mode for a node (pass null to exit).
  setConnectSource: (id: string | null) => void;
  select: (id: string | null) => void;
  setChoice: (id: string, choice: string) => void;
  setModel: (id: string, model: string) => void;
  setTuning: (patch: Partial<Tuning>) => void;
  loadInto: (nodes: Node<PieceNodeData>[], edges: Edge[], tuning: Tuning) => void;
  clear: () => void;
};

let seq = 0;
const nextId = () => `n_${Date.now()}_${seq++}`;

function buildNode(piece: Piece, position: { x: number; y: number }): Node<PieceNodeData> {
  return {
    id: nextId(),
    type: "piece",
    position,
    data: {
      pieceId: piece.id,
      label: piece.label,
      category: piece.category,
      color: getPiece(piece.id)?.category ? colorFor(piece.id) : "#888",
      choice: piece.options?.[0],
      model: getModels(piece.id)?.[0],
    },
  };
}

export const useCanvas = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedId: null,
  tuning: DEFAULT_TUNING,
  fitSignal: 0,
  connectSourceId: null,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<PieceNodeData>[] }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (conn) =>
    // Adding the edge also exits connect mode.
    set({ edges: addEdge({ ...conn, animated: true }, get().edges), connectSourceId: null }),

  addPiece: (piece, position) => {
    const node = buildNode(piece, position);
    set({ nodes: [...get().nodes, node], selectedId: node.id });
  },

  addPieceTap: (piece) => {
    const n = get().nodes.length;
    // Lay taps out in a non-overlapping grid (nodes are ~160px wide); fitSignal
    // then frames them. "Arrange in stages" re-flows into the proper pipeline.
    const position = { x: (n % 3) * 190, y: Math.floor(n / 3) * 120 };
    const node = buildNode(piece, position);
    set({
      nodes: [...get().nodes, node],
      selectedId: node.id,
      fitSignal: get().fitSignal + 1,
    });
  },

  removeNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
      connectSourceId: get().connectSourceId === id ? null : get().connectSourceId,
    }),

  setConnectSource: (id) => set({ connectSourceId: id }),

  select: (id) => set({ selectedId: id }),
  setChoice: (id, choice) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, choice } } : n
      ),
    }),
  setModel: (id, model) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, model } } : n
      ),
    }),
  setTuning: (patch) => set({ tuning: { ...get().tuning, ...patch } }),
  loadInto: (nodes, edges, tuning) =>
    set({ nodes, edges, tuning, selectedId: null, fitSignal: get().fitSignal + 1 }),
  clear: () => set({ nodes: [], edges: [], selectedId: null, connectSourceId: null }),
}));

import { CATEGORIES } from "@/lib/catalog";
function colorFor(pieceId: string): string {
  const p = getPiece(pieceId);
  return p ? CATEGORIES[p.category].color : "#888";
}
