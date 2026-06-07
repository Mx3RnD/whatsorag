// Plain definitions for hover tooltips. Any non-business word on screen looks itself up here.
// Source of truth mirrored in vault: whatsoRAG/Vocabulary.md. Pal may edit wording.

export const DEFINITIONS: Record<string, string> = {
  rag: "Letting an AI answer using your own documents, not just its training.",
  graphrag: "RAG where facts are stored as a network of linked things.",
  hypergraphrag: "RAG where one fact can link many things at once.",
  raganything: "An all-in-one RAG that handles text, images, tables and more.",
  parse: "Turning a file into clean text the computer can use.",
  liteparse: "A fast local tool that parses PDFs and keeps where the text sits.",
  "doc-vlm": "An AI that reads a whole page image: text, tables, charts, layout.",
  ocr: "Reading text out of a picture or scan.",
  vision: "Having an AI look at an image and read or describe it.",
  transcribe: "Turning speech audio into text.",
  "freeze frame": "A still picture grabbed from a video.",
  chunk: "A small passage a document is split into.",
  overlap: "Repeating a little text between passages so context is not cut.",
  embed: "Turning text into numbers that capture its meaning.",
  vectorize: "Turning text into numbers that capture its meaning.",
  fingerprint: "The meaning-numbers for a piece of text.",
  index: "A structure that makes searching those fingerprints fast.",
  "vector database": "A store that finds things by meaning.",
  "relational database": "A store of rows and columns (postgres / sql).",
  hypergraph: "A network where one link can join many things at once.",
  entity: "A thing that matters: a person, ingredient, company, place.",
  relationship: "A link between two entities.",
  canonical: "The one official name for something.",
  aka: "Also known as: the other names for the same thing.",
  dedup: "Removing duplicate copies.",
  normalize: "Making values consistent (units, spelling, format).",
  semantic: "By meaning, not exact words.",
  fuzzy: "Approximate matching that tolerates typos and variants.",
  rerank: "Reordering search results so the best ones come first.",
  multimodal: "Handling text, images, audio and video together.",
  "order aware": "Keeping track of time order and what is latest.",
  embeddings2: "The latest generation of embedding models.",
  "episodic memory": "A memory of events over time: what happened and when, kept alongside meaning search.",
  "semantic memory": "A memory of what things mean, not tied to time.",
};

export function defineTerm(word: string): string | undefined {
  return DEFINITIONS[word.trim().toLowerCase()];
}
