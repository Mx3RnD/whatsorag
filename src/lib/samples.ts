// Mock "what the output looks like" samples. No real data - illustrative previews
// shown in the right panel when an output piece is selected.

export type Sample = { kind: "json" | "md" | "text" | "code"; text: string };

export const SAMPLES: Record<string, Sample> = {
  "qo-json": {
    kind: "json",
    text: `{
  "answer": "Pea protein isolate is 80% protein.",
  "value": 80,
  "unit": "%",
  "source": { "file": "pea-protein-CoA.pdf", "page": 2, "box": [120, 540, 360, 572] },
  "also_reported_as": [82, 78],
  "confidence": 0.91
}`,
  },
  "qo-md": {
    kind: "md",
    text: `# Pea protein isolate

- **Protein:** 80% (also reported as 78, 82)
- **Source:** pea-protein-CoA.pdf, p.2

> Pulled from the certificate of analysis table.`,
  },
  "qo-answer": {
    kind: "text",
    text: `Q: Where did the 80% protein figure come from?

A: From "pea-protein-CoA.pdf", page 2, the composition table
(row "Protein", highlighted region). Two other documents reported
78% and 82%; 80% was kept as the primary value.`,
  },
  "qo-translate": {
    kind: "code",
    text: `translate({
  text: "Pea protein isolate is 80% protein.",
  from: "en",
  to: "ko"
})
// -> "완두콩 단백질 분리물은 단백질 80%입니다."`,
  },
  "qo-encrypted": {
    kind: "code",
    text: `# output scrambled (encrypted) - unreadable without the key
U2FsdGVkX1+9mWqg7nQv2bТ8xR1nKjPq4sZ0c1dФ==
9f83a1c0e7b24d65aa10f3b9c2e84517d0aбвгд...
(decrypt with your key to read)`,
  },
};

export function getSample(pieceId: string): Sample | undefined {
  return SAMPLES[pieceId];
}
