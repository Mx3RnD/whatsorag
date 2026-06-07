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
};

export function explainPiece(id: string): Explain | undefined {
  return EXPLAIN[id];
}
