// whatsoRAG catalog: "what's possible" - the pieces you can drag onto the canvas.
// On-screen labels use ONLY Pal's approved vocabulary (see vault: whatsoRAG/Vocabulary.md).
// Internal ids/keys can stay technical.

export type CategoryKey =
  | "source"
  | "identify"
  | "read"
  | "searchable"
  | "resolve"
  | "store"
  | "query"
  | "rag";

export type Category = {
  key: CategoryKey;
  label: string; // on-screen
  color: string; // node + chip color
  blurb: string;
};

export type Piece = {
  id: string;
  category: CategoryKey;
  label: string; // on-screen (approved vocab)
  blurb: string; // plain, one line
  options?: string[]; // selectable methods/models shown in the config panel
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  source: { key: "source", label: "Sources", color: "#2F6FBF", blurb: "What you feed in." },
  identify: { key: "identify", label: "Identify", color: "#5B5BD6", blurb: "Sort each file by what it is." },
  read: { key: "read", label: "Read", color: "#1B998B", blurb: "Turn a file into text and tables." },
  searchable: { key: "searchable", label: "Make searchable", color: "#3A9D3A", blurb: "Chunk, embed, index." },
  resolve: { key: "resolve", label: "Resolve", color: "#E08A1E", blurb: "Dedup, merge, label, relate." },
  store: { key: "store", label: "Stores", color: "#7B4FB3", blurb: "Where it lands." },
  query: { key: "query", label: "Query and output", color: "#D6336C", blurb: "Ask, rank, show." },
  rag: { key: "rag", label: "RAG type", color: "#23303A", blurb: "How retrieval is wired." },
};

export const PIECES: Piece[] = [
  // Sources (input)
  { id: "src-file", category: "source", label: "File", blurb: "Any file: upload one or many.", options: ["upload", "download"] },
  { id: "src-pdf", category: "source", label: "PDF", blurb: "Born-digital or scanned." },
  { id: "src-photo", category: "source", label: "Photo", blurb: "jpeg, png, gif, heic." },
  { id: "src-audio", category: "source", label: "Audio", blurb: "Voice memo, meeting, call." },
  { id: "src-video", category: "source", label: "Video", blurb: "mp4, mov. Splits into audio + freeze frame." },
  { id: "src-web", category: "source", label: "Web page", blurb: "A URL to read." },
  { id: "src-sheet", category: "source", label: "Spreadsheet", blurb: "csv, xlsx, machine output." },

  // Identify
  { id: "id-identify", category: "identify", label: "Identify", blurb: "Detect type and language per file.", options: ["detect type", "detect language", "categorize", "label"] },
  { id: "id-multimodal", category: "identify", label: "Multimodal", blurb: "Route text, image, audio, video to the right track." },

  // Read / parse
  { id: "rd-parse", category: "read", label: "Parse", blurb: "Read the file into text.", options: ["liteparse", "doc-vlm", "conversion"] },
  { id: "rd-extract-txt", category: "read", label: "Extract txt", blurb: "Pull out the words." },
  { id: "rd-extract-table", category: "read", label: "Extract table", blurb: "Keep tables as tables (markdown)." },
  { id: "rd-ocr", category: "read", label: "OCR", blurb: "Read text baked into a picture.", options: ["tesseract", "paddleocr", "doc-vlm"] },
  { id: "rd-vision", category: "read", label: "Vision", blurb: "Look at the picture and read it.", options: ["openweight VLM", "frontier VLM"] },
  { id: "rd-describe", category: "read", label: "Describe", blurb: "Describe a figure or scene." },
  { id: "rd-transcribe", category: "read", label: "Transcribe", blurb: "Turn speech into text (+ who spoke)." },
  { id: "rd-freeze", category: "read", label: "Freeze frame", blurb: "Grab still frames from a video." },

  // Make searchable
  { id: "se-chunk", category: "searchable", label: "Chunk", blurb: "Split into passages.", options: ["fixed", "recursive", "paragraph", "contextual", "late chunking"] },
  { id: "se-overlap", category: "searchable", label: "Overlap", blurb: "Keep context across chunk edges." },
  { id: "se-embed", category: "searchable", label: "Embed", blurb: "Turn text into searchable meaning.", options: ["voyage-3", "gemini embeddings2", "openweight (bge/nomic/qwen)", "nemotron embed-vl"] },
  { id: "se-vectorize", category: "searchable", label: "Vectorize", blurb: "Make the fingerprint vector." },
  { id: "se-index", category: "searchable", label: "Index", blurb: "Store fingerprints for fast search." },

  // Resolve / organize
  { id: "rs-dedup", category: "resolve", label: "Dedup", blurb: "Remove duplicates." },
  { id: "rs-normalize", category: "resolve", label: "Normalize", blurb: "Make values consistent." },
  { id: "rs-entity", category: "resolve", label: "Entity", blurb: "Pull out the things that matter." },
  { id: "rs-relationship", category: "resolve", label: "Relationship", blurb: "Link entities together." },
  { id: "rs-canonical", category: "resolve", label: "Canonical", blurb: "Pick one primary name (aka the rest).", options: ["aka", "group"] },
  { id: "rs-define", category: "resolve", label: "Define", blurb: "Define an entity or term." },

  // Stores
  { id: "st-vector", category: "store", label: "Vector database", blurb: "Search by meaning." },
  { id: "st-relational", category: "store", label: "Relational database", blurb: "Rows and columns. postgres / sql.", options: ["postgres", "fill in"] },
  { id: "st-hypergraph", category: "store", label: "Hypergraph", blurb: "One fact can link many entities at once." },
  { id: "st-timeline", category: "store", label: "Order aware", blurb: "Keep the timeline / order." },
  { id: "st-episodic", category: "store", label: "Episodic memory", blurb: "Events over time: what happened, when. A parallel memory from the same input." },
  { id: "st-semantic", category: "store", label: "Semantic memory", blurb: "Meaning of things, not tied to time. The other half of memory." },

  // Query / output
  { id: "qo-query", category: "query", label: "Query", blurb: "Ask a question.", options: ["semantic", "fuzzy"] },
  { id: "qo-rerank", category: "query", label: "Rerank", blurb: "Reorder hits by relevance." },
  { id: "qo-dashboard", category: "query", label: "Dashboard", blurb: "Show it as a dashboard." },
  { id: "qo-list", category: "query", label: "List", blurb: "Show it as a list." },
  { id: "qo-render", category: "query", label: "Render", blurb: "Draw the result (viewer, thumbnail)." },

  // RAG type
  { id: "rag-rag", category: "rag", label: "RAG", blurb: "Plain retrieval over chunks." },
  { id: "rag-graph", category: "rag", label: "GraphRAG", blurb: "Retrieval over a graph of links." },
  { id: "rag-hyper", category: "rag", label: "HypergraphRAG", blurb: "Retrieval over n-ary facts." },
  { id: "rag-anything", category: "rag", label: "RAGAnything", blurb: "All-in-one multimodal RAG." },
];

export function piecesByCategory(): Record<CategoryKey, Piece[]> {
  const out = {} as Record<CategoryKey, Piece[]>;
  (Object.keys(CATEGORIES) as CategoryKey[]).forEach((k) => (out[k] = []));
  PIECES.forEach((p) => out[p.category].push(p));
  return out;
}

export function getPiece(id: string): Piece | undefined {
  return PIECES.find((p) => p.id === id);
}
