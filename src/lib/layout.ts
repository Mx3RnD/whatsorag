// Pure layout helper: arrange canvas nodes into left-to-right staged columns,
// one column per category, in the fixed pipeline order. No side effects.

import type { Node } from "@xyflow/react";
import type { PieceNodeData } from "@/store/canvas";
import type { CategoryKey } from "@/lib/catalog";

// The fixed left-to-right order of pipeline stages.
export const STAGE_ORDER: CategoryKey[] = [
  "source",
  "identify",
  "read",
  "searchable",
  "resolve",
  "store",
  "query",
  "rag",
];

// Short, on-screen column headers (plain English) shown across the top.
export const STAGE_LABELS: Record<CategoryKey, string> = {
  source: "Sources",
  identify: "Identify",
  read: "Read",
  searchable: "Make searchable",
  resolve: "Resolve",
  store: "Stores",
  query: "Query",
  rag: "RAG",
};

// Column + row geometry. Kept here so the canvas headers can line up with nodes.
export const COLUMN_WIDTH = 230;
export const ROW_HEIGHT = 90;
export const TOP_OFFSET = 30;

// Returns the same nodes with new positions: x by stage column, y stacked per column.
// Pure: produces new node objects, does not mutate the input.
export function arrangeInStages(
  nodes: Node<PieceNodeData>[]
): Node<PieceNodeData>[] {
  const rowByColumn: Record<number, number> = {};

  return nodes.map((node) => {
    const category = node.data.category as CategoryKey;
    const columnIndex = STAGE_ORDER.indexOf(category);
    const col = columnIndex === -1 ? STAGE_ORDER.length : columnIndex;
    const row = rowByColumn[col] ?? 0;
    rowByColumn[col] = row + 1;

    return {
      ...node,
      position: {
        x: col * COLUMN_WIDTH,
        y: TOP_OFFSET + row * ROW_HEIGHT,
      },
    };
  });
}
