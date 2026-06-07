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
  { id: "id-language", category: "identify", label: "Detect language", blurb: "Detect which language(s) the content is in, for multilingual handling." },
  { id: "id-multimodal", category: "identify", label: "Multimodal", blurb: "Route text, image, audio, video to the right track." },
  { id: "id-categorize", category: "identify", label: "Categorize", blurb: "Sort items into groups or types.", options: ["by topic", "by kind", "by source"] },
  { id: "id-fields", category: "identify", label: "Identify fields", blurb: "Detect what fields or structure are present (defined vs not)." },
  { id: "id-source", category: "identify", label: "Identify source", blurb: "Detect where it came from." },
  { id: "id-topic", category: "identify", label: "Identify topic", blurb: "Detect what it is about." },
  { id: "id-origin", category: "identify", label: "Identify origin", blurb: "Detect the origin and type of the item." },
  { id: "id-scan", category: "identify", label: "Scan contents", blurb: "Look inside: does it have text, tables, pictures, or is it just a scan?" },

  // Read / parse
  { id: "rd-parse", category: "read", label: "Parse", blurb: "Read the file into text.", options: ["liteparse", "doc-vlm", "conversion"] },
  { id: "rd-convert", category: "read", label: "Convert", blurb: "Change a file to another format (e.g. office to pdf)." },
  { id: "rd-screenshot", category: "read", label: "Screenshot", blurb: "Capture a page or screen as an image for vision." },
  { id: "rd-research", category: "read", label: "Research further", blurb: "Look things up to fill gaps (enrich)." },
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
  { id: "se-summary-tree", category: "searchable", label: "Summary tree", blurb: "Group and summarize passages into layers, so you can pull the big picture or the detail." },

  // Resolve / organize
  { id: "rs-dedup", category: "resolve", label: "Dedup", blurb: "Remove duplicates." },
  { id: "rs-normalize", category: "resolve", label: "Normalize", blurb: "Make values consistent." },
  { id: "rs-entity", category: "resolve", label: "Entity", blurb: "Pull out the things that matter." },
  { id: "rs-relationship", category: "resolve", label: "Relationship", blurb: "Link entities together." },
  { id: "rs-canonical", category: "resolve", label: "Canonical", blurb: "Pick one primary name (aka the rest).", options: ["aka", "group"] },
  { id: "rs-define", category: "resolve", label: "Define", blurb: "Define an entity or term." },
  { id: "rs-name", category: "resolve", label: "Name", blurb: "Give it a canonical name or label." },
  { id: "rs-enrich", category: "resolve", label: "Enrich", blurb: "Add extra detail to an entity from other sources." },
  { id: "rs-bbox", category: "resolve", label: "Bounding box", blurb: "Mark exactly where on the page a fact came from (source trail), for highlighting." },
  { id: "rs-fingerprint", category: "resolve", label: "Fingerprint", blurb: "Attribute content to who made it: speaker (voice), writer (style), or source.", options: ["speaker (voice)", "writer (style)", "source"] },
  { id: "rs-flag", category: "resolve", label: "Flag gaps", blurb: "Flag items missing required context (e.g. undated QC data) for follow-up." },

  // Stores
  { id: "st-vector", category: "store", label: "Vector database", blurb: "Search by meaning." },
  { id: "st-relational", category: "store", label: "Relational database", blurb: "Rows and columns. postgres / sql.", options: ["postgres", "fill in"] },
  { id: "st-graph", category: "store", label: "Graph database", blurb: "A network of things and the two-way links between them (e.g. neo4j)." },
  { id: "st-hypergraph", category: "store", label: "Hypergraph", blurb: "One fact can link many entities at once (n-ary, beyond two-way)." },
  { id: "st-hierarchy", category: "store", label: "Hierarchy", blurb: "A layered store: overview at the top, detail at the bottom (RAPTOR-style tree)." },
  { id: "st-timeline", category: "store", label: "Order aware", blurb: "Keep the timeline / order." },
  { id: "st-episodic", category: "store", label: "Episodic memory", blurb: "Events over time: what happened, when. A parallel memory from the same input." },
  { id: "st-semantic", category: "store", label: "Semantic memory", blurb: "Meaning of things, not tied to time. The other half of memory." },

  // Query / output
  { id: "qo-query", category: "query", label: "Query", blurb: "Ask a question.", options: ["semantic", "fuzzy"] },
  { id: "qo-rerank", category: "query", label: "Rerank", blurb: "Reorder hits by relevance." },
  { id: "qo-dashboard", category: "query", label: "Dashboard", blurb: "Show it as a dashboard." },
  { id: "qo-list", category: "query", label: "List", blurb: "Show it as a list." },
  { id: "qo-render", category: "query", label: "Render", blurb: "Draw the result (viewer, thumbnail)." },
  { id: "qo-json", category: "query", label: "Output json", blurb: "Give the result as json." },
  { id: "qo-md", category: "query", label: "Output md", blurb: "Give the result as a markdown file." },
  { id: "qo-answer", category: "query", label: "Output answer", blurb: "Answer a question with its source trail: where did this come from." },
  { id: "qo-translate", category: "query", label: "Output translate", blurb: "Output a command to translate the result." },
  { id: "qo-encrypted", category: "query", label: "Output encrypted", blurb: "Scramble the output so only someone with the key can read it." },

  // RAG type
  { id: "rag-rag", category: "rag", label: "RAG", blurb: "Plain retrieval over chunks." },
  { id: "rag-graph", category: "rag", label: "GraphRAG", blurb: "Retrieval over a graph of links." },
  { id: "rag-hyper", category: "rag", label: "HypergraphRAG", blurb: "Retrieval over n-ary facts." },
  { id: "rag-anything", category: "rag", label: "RAGAnything", blurb: "All-in-one multimodal RAG." },
  { id: "rag-raptor", category: "rag", label: "RAPTOR", blurb: "Summarizes long documents into layers, then answers from the right layer for big-picture or detail." },
  { id: "rag-hippo", category: "rag", label: "HippoRAG", blurb: "Builds a memory of linked facts and answers multi-part questions in one hop, brain-style." },
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

// Model choices for pieces that use an LLM / model. Open-weight and frontier, labelled.
export const MODELS: Record<string, string[]> = {
  "rd-parse": ["LiteParse (local)", "Nemotron Parse", "Granite-Docling (open)", "PaddleOCR-VL (open)", "LlamaParse (cloud)"],
  "rd-ocr": ["Tesseract (open)", "PaddleOCR-VL (open)", "Nemotron OCR", "doc-vlm"],
  "rd-vision": ["Claude vision (frontier)", "Qwen2.5-VL (open)", "Llama-Vision (open)", "Nemotron VL"],
  "rd-describe": ["Claude Sonnet (frontier)", "Claude Opus (frontier)", "Qwen2.5-VL (open)"],
  "rd-transcribe": ["Whisper large-v3 (open)", "faster-whisper (open)", "WhisperX (open)"],
  "rd-research": ["Claude (frontier)", "Qwen (open)"],
  "rs-entity": ["Claude Opus (frontier)", "Claude Sonnet (frontier)", "Qwen2.5 (open)"],
  "rs-relationship": ["Claude Opus (frontier)", "Claude Sonnet (frontier)", "Qwen2.5 (open)"],
  "rs-enrich": ["Claude (frontier)", "Qwen (open)"],
  "qo-query": ["Claude (frontier)", "Llama-Nemotron Super (open)", "Qwen (open)"],
  "qo-answer": ["Claude (frontier)", "Llama-Nemotron Super (open)", "Qwen (open)"],
  "qo-translate": ["Claude (frontier)", "Qwen (open)"],
};

export function getModels(id: string): string[] | undefined {
  return MODELS[id];
}
