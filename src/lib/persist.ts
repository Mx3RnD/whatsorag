"use client";

// v1 save/load to localStorage. Phase 2 swaps this for the whatsorag Supabase.
import type { Node, Edge } from "@xyflow/react";
import type { PieceNodeData, Tuning } from "@/store/canvas";

const KEY = "whatsorag.flows";

export type SavedFlow = {
  id: string;
  name: string;
  nodes: Node<PieceNodeData>[];
  edges: Edge[];
  tuning: Tuning;
  savedAt: number;
};

export function listFlows(): SavedFlow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as SavedFlow[];
  } catch {
    return [];
  }
}

export function saveFlow(flow: Omit<SavedFlow, "id" | "savedAt"> & { id?: string }): SavedFlow {
  const all = listFlows();
  const id = flow.id || `f_${Date.now()}`;
  const record: SavedFlow = { ...flow, id, savedAt: Date.now() };
  const next = [record, ...all.filter((f) => f.id !== id)];
  localStorage.setItem(KEY, JSON.stringify(next));
  return record;
}

export function loadFlow(id: string): SavedFlow | undefined {
  return listFlows().find((f) => f.id === id);
}

export function deleteFlow(id: string) {
  localStorage.setItem(KEY, JSON.stringify(listFlows().filter((f) => f.id !== id)));
}
