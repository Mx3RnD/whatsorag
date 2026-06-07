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
  onNodesChange: (c: NodeChange[]) => void;
  onEdgesChange: (c: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;
  addPiece: (piece: Piece, position: { x: number; y: number }) => void;
  select: (id: string | null) => void;
  setChoice: (id: string, choice: string) => void;
  setModel: (id: string, model: string) => void;
  setTuning: (patch: Partial<Tuning>) => void;
  loadInto: (nodes: Node<PieceNodeData>[], edges: Edge[], tuning: Tuning) => void;
  clear: () => void;
};

let seq = 0;
const nextId = () => `n_${Date.now()}_${seq++}`;

export const useCanvas = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedId: null,
  tuning: DEFAULT_TUNING,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<PieceNodeData>[] }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (conn) =>
    set({ edges: addEdge({ ...conn, animated: true }, get().edges) }),

  addPiece: (piece, position) => {
    const id = nextId();
    const node: Node<PieceNodeData> = {
      id,
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
    set({ nodes: [...get().nodes, node], selectedId: id });
  },

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
  loadInto: (nodes, edges, tuning) => set({ nodes, edges, tuning, selectedId: null }),
  clear: () => set({ nodes: [], edges: [], selectedId: null }),
}));

import { CATEGORIES } from "@/lib/catalog";
function colorFor(pieceId: string): string {
  const p = getPiece(pieceId);
  return p ? CATEGORIES[p.category].color : "#888";
}
