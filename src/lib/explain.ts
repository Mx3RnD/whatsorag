// Per-piece explanations shown in the inspector when a node is selected.
// Plain English. "what" = what it does, "when" = when to use it, "vs" = how it differs
// from similar pieces (the part people get confused by).
// Starter set covers the overlapping clusters; the rest fall back to the piece blurb.

export type Explain = { what: string; when?: string; vs?: string };

export const EXPLAIN: Record<string, Explain> = {
  // --- the confusing "identify" cluster -------------------------------------
  "id-identify": {
    what: "The first triage: detect what a file IS - its type (pdf, image, audio...) and its language - so it can be sent down the right track.",
    when: "Always, at the very start, before reading anything.",
    vs: "Identify = what kind of file. Categorize = what bucket it belongs in. Identify fields = what structure is inside. Identify topic = what it is about.",
  },
  "id-scan": {
    what: "Looks INSIDE the file and reports what it actually contains: real text, tables, pictures/charts, or whether it is just a scan (pixels, no text).",
    when: "Right after Identify, to decide the read path. Has tables -> extract tables. Is a scan -> OCR. Has pictures -> vision.",
    vs: "Identify says 'this is a PDF'. Scan contents says 'this PDF has 3 tables, 2 charts, and is born-digital (not a scan)'.",
  },
  "id-categorize": {
    what: "Puts the item into a bucket or group (by topic, by kind, or by source).",
    when: "When you want to file things into known groups for routing or filtering.",
    vs: "Categorize = which bucket. Identify topic = what subject it covers (can be free-form, not a fixed bucket).",
  },
  "id-fields": {
    what: "Detects the structure inside: which fields/columns exist, and whether the data is structured (like a table) or unstructured (like prose).",
    when: "For spreadsheets, forms, lab sheets, CoAs - anything where you map values into named fields later.",
    vs: "Identify fields = the SHAPE of the data (columns/fields). Identify topic = the SUBJECT. Categorize = the bucket.",
  },
  "id-topic": {
    what: "Detects what the item is ABOUT - its subject matter (e.g. 'pea protein', 'a sales call', 'a lease clause').",
    when: "For routing by subject, tagging, and grouping related items.",
    vs: "Topic = subject. Fields = structure. Source/origin = where it came from.",
  },
  "id-source": {
    what: "Detects where the item came from (which system, person, upload, or feed).",
    when: "For provenance and trust - knowing the supplier of each item.",
    vs: "Source = where it came from. Origin = where + what type of thing produced it (e.g. 'a lab instrument export').",
  },
  "id-origin": {
    what: "Detects the origin AND the type of thing that produced the item (e.g. 'instrument export', 'scanned contract', 'web article').",
    when: "When the producing system/type changes how you should read it.",
    vs: "Origin is a bit broader than Source: Source = who/where; Origin = who/where + what kind of producer.",
  },

  // --- file vs specific types ----------------------------------------------
  "src-file": {
    what: "A generic catch-all input for when you do not want to specify the type. It gets identified and routed automatically.",
    when: "When you are dropping mixed files, or do not know/care about the type up front.",
    vs: "File = 'whatever, figure it out'. PDF / Photo / Audio = you already know the type, so it goes straight to that track.",
  },
  "src-pdf": {
    what: "Specifically a PDF. PDFs split two ways: born-digital (has real selectable text) or scanned (just pixels).",
    when: "Documents, reports, specs, CoAs, contracts.",
    vs: "PDF vs File: PDF has a known read path (text + tables, or OCR if scanned). File is the unknown-type catch-all.",
  },
  "src-photo": {
    what: "An image (jpeg, png, gif, heic). Pixels, so it needs OCR for any text and vision to understand the picture.",
    when: "Photos, screenshots of things, pictures of labels or whiteboards.",
    vs: "Photo vs PDF-scan: both are pixels, but a PDF can also be born-digital text; a photo never is.",
  },

  // --- the design questions as pieces ---------------------------------------
  "rs-fingerprint": {
    what: "Works out WHO made the content. Audio: separate and identify speakers by voice (diarization plus a voice signature). Text: attribute the author by writing style, or from metadata.",
    when: "Meeting logs, multi-author corpora, anything where 'who said or wrote this' matters.",
    vs: "Fingerprint = who made it. Entity = things mentioned in it. Source = which system it came from.",
  },
  "rs-flag": {
    what: "Checks each item for the context it needs and flags what is missing (e.g. a QC value with no date, no units, or no source), so it can be chased or held back from calculations.",
    when: "Any data you will calculate on or trust - lab and QC data, specs, financials.",
    vs: "Flag gaps spots what is missing; Enrich then fills it; Normalize fixes the format.",
  },

  // --- the retrieve stage ---------------------------------------------------
  "rt-route": {
    what: "Decides where to look: which store(s) and which retrieval path best fit this question (e.g. vector search for meaning, graph traversal for linked facts).",
    when: "Right after the question is embedded, when you have more than one store or strategy to choose between.",
    vs: "Route picks WHERE and HOW to search. Query (later) is the user asking. Path expansion is what happens once a route through the graph is chosen.",
  },
  "rt-expand": {
    what: "Starts from the first matching facts and follows their links outward to gather related facts the question may also need.",
    when: "When facts are linked (graph or hypergraph store) and answers depend on more than the single best-matching passage.",
    vs: "Path expansion grows the candidate set by following links. Hops is the dial for how far it expands. Hyperedge filtration trims what it brings back.",
  },
  "rt-fusion": {
    what: "Merges the results that came back from several paths or stores into one combined, comparable set.",
    when: "Whenever you searched more than one way (e.g. meaning + keyword, or vector + graph) and need a single ranked list.",
    vs: "Fusion combines result sets. Weighted simulation combines scoring factors within results. Rerank is the final reorder after fusion.",
  },
  "rt-hyperfilter": {
    what: "Keeps only the many-at-once (n-ary) facts that actually matter to the question, and drops hyperedges that are off-topic.",
    when: "Only when a hypergraph store is in play, where one fact can join many entities at once.",
    vs: "Hyperedge filtration trims n-ary facts specifically. Score and prune trims any branch. Constraints filter on metadata like date.",
  },
  "rt-hops": {
    what: "Sets how many link-steps to travel out from the starting facts (1 hop = direct neighbours, 2 hops = neighbours of neighbours, and so on).",
    when: "Graph or hypergraph retrieval, when answers need connected facts. More hops finds more, but costs more and can drift off-topic.",
    vs: "Hops is the distance dial. Path expansion is the act of traversing. Priority queue decides the order you traverse in.",
  },
  "rt-semantic": {
    what: "Scores how close a candidate fact is to the question in meaning, using the embedding fingerprints.",
    when: "Almost always - it is the core relevance signal.",
    vs: "One of four scoring factors. Semantic = meaning. Temporal = time fit. Spatial = place fit. Structural = how connected the fact is.",
  },
  "rt-temporal": {
    what: "Scores how well a fact fits the time and order the question cares about (recent enough, in the right sequence).",
    when: "When order matters - an order-aware or episodic store, or time-sensitive questions ('the latest', 'before launch').",
    vs: "One of four scoring factors. Temporal = when. Semantic = meaning. Plain semantic search alone ignores time.",
  },
  "rt-spatial": {
    what: "Scores how much a fact's location on a page or in an image overlaps what the question is about (e.g. a value inside the right table or region).",
    when: "When images, video frames, or page layout carry meaning and you tracked where things sit (bounding boxes).",
    vs: "One of four scoring factors. Spatial = where on the page/image. Semantic = meaning. Needs spatial data (bounding boxes) to work.",
  },
  "rt-structural": {
    what: "Scores how central a fact is in the network of links - well-connected, hub-like facts score higher.",
    when: "Graph or hypergraph retrieval, to favour facts that tie many things together over isolated ones.",
    vs: "One of four scoring factors. Structural = importance in the graph. Semantic = meaning. It needs a graph to measure against.",
  },
  "rt-weighted": {
    what: "Combines the scoring factors (semantic, temporal, spatial, structural) into a single ranking, each factor given its own weight.",
    when: "After multi-factor scoring, to turn several signals into one ordered shortlist.",
    vs: "Weighted simulation blends the FACTORS into one score. Fusion blends RESULT SETS from different paths. Rerank is the final pass on top.",
  },
  "rt-segment": {
    what: "Pulls out the exact passages or segments from the winning facts - the precise evidence to send on, not the whole document.",
    when: "Once the top results are chosen, to trim each down to the relevant span before handing it to the assistant.",
    vs: "Context segment extraction selects the SPANS to send. Chunk (earlier) split the document for storage. Dedup then removes repeats.",
  },
  "rt-rerank": {
    what: "Final best-first reorder with a cross-encoder: a slower, more accurate model reads the question and each candidate together and re-sorts them.",
    when: "Last step before answering, on the shortlist, to maximise that the very top results are the most relevant.",
    vs: "Cross-encoder rerank reads question + candidate together (accurate, slow), so it goes last on a short list. The earlier embedding match scores them separately (fast, approximate). This is the final rerank, distinct from any earlier reorder.",
  },
  "rt-answer": {
    what: "Hands the ranked, deduplicated, source-tagged context to the assistant so it can write the answer grounded in that evidence.",
    when: "The end of retrieval, the bridge into generation.",
    vs: "Ranked answer to bot delivers the context to the model. Output answer (in Query) is the finished, cited reply shown to the user.",
  },
};

export function explainPiece(id: string): Explain | undefined {
  return EXPLAIN[id];
}
